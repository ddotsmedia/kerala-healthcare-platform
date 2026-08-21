// @khp/storage — S3 / Cloudflare R2 object storage via SigV4 (no SDK).
// When S3 is not configured, storeFile() falls back to an inline base64 data URI
// so existing upload flows keep working unchanged. Private files are stored as a
// "s3:<key>" reference and served through a short-lived signed URL.

import { signRequest, presignUrl, sha256hex, encodeKey } from './sigv4.js';

function cfg() {
  return {
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION || (process.env.S3_ENDPOINT ? 'auto' : 'us-east-1'),
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    endpoint: process.env.S3_ENDPOINT || '',
    publicBase: process.env.S3_PUBLIC_BASE || ''
  };
}

export function isConfigured() {
  const c = cfg();
  return !!(c.bucket && c.accessKey && c.secretKey);
}

function endpointParts() {
  const c = cfg();
  if (c.endpoint) {
    const u = new URL(c.endpoint);
    return { host: u.host, protocol: u.protocol, pathStyle: true };
  }
  return { host: `${c.bucket}.s3.${c.region}.amazonaws.com`, protocol: 'https:', pathStyle: false };
}

/** The request path for a key (path-style prefixes the bucket). */
function keyPath(key) {
  const c = cfg();
  const e = endpointParts();
  return e.pathStyle ? `/${c.bucket}/${key}` : `/${key}`;
}

/** Public URL for a key (CDN base if provided, else the object endpoint). */
export function publicUrl(key) {
  const c = cfg();
  if (c.publicBase) return `${c.publicBase.replace(/\/$/, '')}/${encodeKey(key)}`;
  const e = endpointParts();
  return `${e.protocol}//${e.host}${keyPath(encodeKey(key))}`;
}

const safeName = (n) => String(n || 'file').replace(/[^\w.\-]+/g, '_').slice(-120);

/**
 * Upload a buffer to S3/R2.
 * @returns {Promise<{key:string, url:string}>}
 */
export async function uploadFile(buffer, filename, contentType, folder = '') {
  if (!isConfigured()) throw new Error('storage_not_configured');
  const c = cfg();
  const e = endpointParts();
  const key = `${folder}${folder && !folder.endsWith('/') ? '/' : ''}${Date.now()}-${safeName(filename)}`;
  const payloadHash = sha256hex(buffer);
  const headers = signRequest({
    method: 'PUT', host: e.host, path: keyPath(key), payloadHash,
    headers: { 'content-type': contentType || 'application/octet-stream' },
    region: c.region, accessKey: c.accessKey, secretKey: c.secretKey
  });
  const res = await fetch(`${e.protocol}//${e.host}${keyPath(encodeKey(key))}`, { method: 'PUT', headers, body: buffer });
  if (!res.ok) throw new Error(`s3_put_${res.status}:${(await res.text().catch(() => '')).slice(0, 120)}`);
  return { key, url: publicUrl(key) };
}

/** Delete an object by key or "s3:<key>" reference or full URL. */
export async function deleteFile(ref) {
  if (!isConfigured() || !ref) return { ok: false };
  const key = refToKey(ref);
  if (!key) return { ok: false };
  const c = cfg();
  const e = endpointParts();
  const headers = signRequest({
    method: 'DELETE', host: e.host, path: keyPath(key), payloadHash: sha256hex(''),
    region: c.region, accessKey: c.accessKey, secretKey: c.secretKey
  });
  const res = await fetch(`${e.protocol}//${e.host}${keyPath(encodeKey(key))}`, { method: 'DELETE', headers });
  return { ok: res.ok };
}

/** Presigned GET URL for a private object. */
export function getSignedUrl(keyOrRef, expiresIn = 3600) {
  if (!isConfigured()) return null;
  const key = refToKey(keyOrRef);
  const c = cfg();
  const e = endpointParts();
  return presignUrl({
    method: 'GET', protocol: e.protocol, host: e.host, path: keyPath(key),
    region: c.region, accessKey: c.accessKey, secretKey: c.secretKey, expiresIn
  });
}

/** Extract the object key from a key, "s3:<key>", or a full object URL. */
export function refToKey(ref) {
  const s = String(ref || '');
  if (s.startsWith('s3:')) return s.slice(3);
  if (/^https?:\/\//.test(s)) {
    try {
      const c = cfg();
      let p = decodeURIComponent(new URL(s).pathname).replace(/^\//, '');
      if (endpointParts().pathStyle && p.startsWith(`${c.bucket}/`)) p = p.slice(c.bucket.length + 1);
      return p;
    } catch { return ''; }
  }
  return s;
}

export function isStoredRef(v) {
  return typeof v === 'string' && (v.startsWith('s3:') || /^https?:\/\//.test(v));
}

/**
 * Store an uploaded file. Uses S3 when configured; otherwise returns an inline
 * base64 data URI (legacy behaviour). Private files return a "s3:<key>" ref.
 * @returns {Promise<{fileUrl:string, key?:string, stored:'s3'|'inline'}>}
 */
export async function storeFile(buffer, contentType, { folder = '', filename = 'file', isPrivate = true } = {}) {
  if (isConfigured()) {
    const { key, url } = await uploadFile(buffer, filename, contentType, folder);
    return { fileUrl: isPrivate ? `s3:${key}` : url, key, stored: 's3' };
  }
  return { fileUrl: `data:${contentType || 'application/octet-stream'};base64,${buffer.toString('base64')}`, stored: 'inline' };
}
