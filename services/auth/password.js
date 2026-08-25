// password.js — password hashing with node:crypto scrypt (no bcrypt dependency).
// Format: "scrypt$<saltHex>$<keyHex>". Verify is constant-time.

import crypto from 'node:crypto';

const KEYLEN = 64;

/** @param {string} password @returns {string} stored hash */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(String(password), salt, KEYLEN);
  return `scrypt$${salt.toString('hex')}$${key.toString('hex')}`;
}

/** @param {string} password @param {string} stored @returns {boolean} */
export function verifyPassword(password, stored) {
  try {
    const [scheme, saltHex, keyHex] = String(stored || '').split('$');
    if (scheme !== 'scrypt' || !saltHex || !keyHex) return false;
    const expected = Buffer.from(keyHex, 'hex');
    const actual = crypto.scryptSync(String(password), Buffer.from(saltHex, 'hex'), expected.length || KEYLEN);
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  } catch { return false; }
}
