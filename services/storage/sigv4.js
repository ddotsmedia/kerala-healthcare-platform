// sigv4.js — AWS Signature Version 4 for S3 / R2, using only node:crypto.
// No SDK dependency. Supports header-auth (PUT/GET/DELETE) and query-auth
// (presigned URLs).

import crypto from 'node:crypto';

const sha256hex = (data) => crypto.createHash('sha256').update(data).digest('hex');
const hmac = (key, data) => crypto.createHmac('sha256', key).update(data, 'utf8').digest();

/** RFC3986 encode a path, keeping '/' as separators. */
export function encodeKey(key) {
  return String(key).split('/').map((seg) => encodeURIComponent(seg)).join('/');
}
const encRfc = (s) => encodeURIComponent(s).replace(/[!*'()]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);

function amzDates(date) {
  const iso = date.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const amzdate = `${iso.slice(0, 8)}T${iso.slice(9, 15)}Z`;
  return { amzdate, datestamp: amzdate.slice(0, 8) };
}

function signingKey(secret, datestamp, region, service) {
  const kDate = hmac(`AWS4${secret}`, datestamp);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, service);
  return hmac(kService, 'aws4_request');
}

/**
 * Header-auth signing. Returns the headers to send (incl. Authorization).
 * @param {object} o { method, host, path, query?, headers, payloadHash, region, service, accessKey, secretKey, date }
 */
export function signRequest(o) {
  const service = o.service || 's3';
  const region = o.region || 'us-east-1';
  const { amzdate, datestamp } = amzDates(o.date || new Date());
  const headers = { host: o.host, 'x-amz-content-sha256': o.payloadHash, 'x-amz-date': amzdate, ...o.headers };

  const sortedKeys = Object.keys(headers).map((k) => k.toLowerCase()).sort();
  const canonicalHeaders = sortedKeys.map((k) => {
    const realKey = Object.keys(headers).find((h) => h.toLowerCase() === k);
    return `${k}:${String(headers[realKey]).trim().replace(/\s+/g, ' ')}\n`;
  }).join('');
  const signedHeaders = sortedKeys.join(';');

  const query = o.query || {};
  const canonicalQuery = Object.keys(query).sort().map((k) => `${encRfc(k)}=${encRfc(query[k])}`).join('&');

  const canonicalRequest = [o.method, encodeKey(o.path), canonicalQuery, canonicalHeaders, signedHeaders, o.payloadHash].join('\n');
  const scope = `${datestamp}/${region}/${service}/aws4_request`;
  const stringToSign = ['AWS4-HMAC-SHA256', amzdate, scope, sha256hex(canonicalRequest)].join('\n');
  const signature = hmac(signingKey(o.secretKey, datestamp, region, service), stringToSign).toString('hex');

  return {
    ...headers,
    Authorization: `AWS4-HMAC-SHA256 Credential=${o.accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
  };
}

/**
 * Query-auth (presigned URL). Returns the full signed URL.
 * @param {object} o { method, protocol, host, path, region, service, accessKey, secretKey, expiresIn, date }
 */
export function presignUrl(o) {
  const service = o.service || 's3';
  const region = o.region || 'us-east-1';
  const { amzdate, datestamp } = amzDates(o.date || new Date());
  const scope = `${datestamp}/${region}/${service}/aws4_request`;
  const signedHeaders = 'host';

  const q = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': `${o.accessKey}/${scope}`,
    'X-Amz-Date': amzdate,
    'X-Amz-Expires': String(o.expiresIn || 3600),
    'X-Amz-SignedHeaders': signedHeaders
  };
  const canonicalQuery = Object.keys(q).sort().map((k) => `${encRfc(k)}=${encRfc(q[k])}`).join('&');
  const canonicalHeaders = `host:${o.host}\n`;
  const canonicalRequest = [o.method || 'GET', encodeKey(o.path), canonicalQuery, canonicalHeaders, signedHeaders, 'UNSIGNED-PAYLOAD'].join('\n');
  const stringToSign = ['AWS4-HMAC-SHA256', amzdate, scope, sha256hex(canonicalRequest)].join('\n');
  const signature = hmac(signingKey(o.secretKey, datestamp, region, service), stringToSign).toString('hex');

  return `${o.protocol || 'https:'}//${o.host}${encodeKey(o.path)}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

export { sha256hex };
