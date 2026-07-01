// crypto.js — primitives for JWT/OTP. Node crypto only (no new packages).

import { createHmac, createHash, randomInt, randomBytes, timingSafeEqual } from 'node:crypto';

function pepper() {
  return process.env.AUTH_PEPPER || process.env.JWT_SECRET || 'dev-pepper';
}

/** URL-safe base64 without padding. */
function b64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlJson(obj) {
  return b64url(JSON.stringify(obj));
}

function hmac256(data, secret) {
  return createHmac('sha256', secret).update(data).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function sha256hex(data) {
  return createHash('sha256').update(String(data)).digest('hex');
}

/** Peppered hash for mobile numbers and OTP codes. */
function pepperedHash(value) {
  return sha256hex(`${value}:${pepper()}`);
}

function sixDigitCode() {
  return String(randomInt(0, 1000000)).padStart(6, '0');
}

function opaqueToken(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}

/** Constant-time string compare. */
function safeEqual(a, b) {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

export { b64url, b64urlJson, hmac256, sha256hex, pepperedHash, sixDigitCode, opaqueToken, safeEqual };
