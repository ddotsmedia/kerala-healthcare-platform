// jwt.js — minimal HS256 JWT sign/verify. No external package.

import { b64url, b64urlJson, hmac256, safeEqual } from './crypto.js';

const ACCESS_TTL_SECONDS = 15 * 60; // 15 minutes

function secret() {
  return process.env.JWT_SECRET || 'dev-jwt-secret';
}

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Sign a short-lived access token.
 * @param {{sub:string, role:string}} claims
 */
function signAccess(claims, ttl = ACCESS_TTL_SECONDS) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const iat = nowSec();
  const payload = { sub: claims.sub, role: claims.role, type: 'access', iat, exp: iat + ttl };
  const head = b64urlJson(header);
  const body = b64urlJson(payload);
  const sig = hmac256(`${head}.${body}`, secret());
  return `${head}.${body}.${sig}`;
}

/**
 * Verify + decode an access token.
 * @returns {{valid:boolean, payload?:object, error?:string}}
 */
function verifyAccess(token) {
  if (!token || typeof token !== 'string') return { valid: false, error: 'no_token' };
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false, error: 'malformed' };
  const [head, body, sig] = parts;
  const expected = hmac256(`${head}.${body}`, secret());
  if (!safeEqual(sig, expected)) return { valid: false, error: 'bad_signature' };
  let payload;
  try {
    payload = JSON.parse(Buffer.from(body.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  } catch {
    return { valid: false, error: 'bad_payload' };
  }
  if (payload.exp && payload.exp < nowSec()) return { valid: false, error: 'expired' };
  return { valid: true, payload };
}

export { signAccess, verifyAccess, ACCESS_TTL_SECONDS };
