// otp.js — OTP generation + verification for mobile (SMS) and email (Resend).
// Codes are stored hashed in Postgres with a short TTL; delivery goes through the
// notifications service. Send throttle is per-identity (5 sends / 10 min).

import { getPool } from '@khp/db';
import { sendSms, sendEmail, otpEmailTemplate } from '@khp/notifications';
import { pepperedHash, sixDigitCode } from './crypto.js';

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const THROTTLE_MAX = 5;
const THROTTLE_WINDOW_MS = 10 * 60 * 1000;

function hashMobile(mobile) {
  return pepperedHash(String(mobile).trim());
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function hashEmail(email) {
  return pepperedHash(normalizeEmail(email));
}

// In-process send throttle (same shape as @khp/cache's Map store). Keyed by the
// identity hash so mobile and email share the 5/10min limit independently.
const sendLog = new Map();
function throttled(key) {
  const now = Date.now();
  const hits = (sendLog.get(key) || []).filter((t) => now - t < THROTTLE_WINDOW_MS);
  if (hits.length >= THROTTLE_MAX) { sendLog.set(key, hits); return true; }
  hits.push(now);
  sendLog.set(key, hits);
  return false;
}

async function storeCode(column, hash, codeHash) {
  const pool = getPool();
  await pool.query(`DELETE FROM otp_codes WHERE ${column} = $1`, [hash]);
  await pool.query(
    `INSERT INTO otp_codes (${column}, code_hash, expires_at)
     VALUES ($1, $2, now() + interval '${OTP_TTL_MINUTES} minutes')`,
    [hash, codeHash]
  );
}

/**
 * Generate + send an OTP for a mobile number (SMS). SMS-gateway failures are
 * logged, not thrown — the code is still stored so login can proceed once SMS
 * is configured (dev surfaces debugCode).
 * @returns {Promise<{ok:boolean, channel:'mobile', debugCode?:string, delivery?:string}>}
 */
async function requestOtp(mobile) {
  if (!mobile) return { ok: false, channel: 'mobile' };
  const mh = hashMobile(mobile);
  if (throttled(`otp:mobile:${mh}`)) return { ok: false, channel: 'mobile', error: 'rate_limited' };
  const code = sixDigitCode();
  await storeCode('mobile_hash', mh, pepperedHash(code));
  const r = await sendSms(mobile, `Kerala Health Portal OTP: ${code} (valid ${OTP_TTL_MINUTES} min)`);
  if (r.status === 'failed') console.warn(`[otp] SMS delivery failed: ${r.error}`);
  return {
    ok: true,
    channel: 'mobile',
    delivery: r.status,
    debugCode: process.env.AUTH_OTP_DEBUG === '1' ? code : undefined
  };
}

/**
 * Generate + send an OTP to an email address (Resend).
 * @returns {Promise<{ok:boolean, channel:'email', debugCode?:string, delivery?:string}>}
 */
async function requestEmailOtp(email, locale = 'ml') {
  if (!email) return { ok: false, channel: 'email' };
  const eh = hashEmail(email);
  if (throttled(`otp:email:${eh}`)) return { ok: false, channel: 'email', error: 'rate_limited' };
  const code = sixDigitCode();
  await storeCode('email_hash', eh, pepperedHash(code));
  const tpl = otpEmailTemplate(code, locale);
  const r = await sendEmail(normalizeEmail(email), tpl.subject, tpl.html, tpl.text);
  if (r.status === 'failed') console.warn(`[otp] email delivery failed: ${r.error}`);
  return {
    ok: r.status === 'sent' || r.status === 'simulated',
    channel: 'email',
    delivery: r.status,
    debugCode: process.env.AUTH_OTP_DEBUG === '1' ? code : undefined
  };
}

async function consumeCode(column, hash, code) {
  const pool = getPool();
  const row = (await pool.query(
    `SELECT id, code_hash, attempts, expires_at < now() AS expired
       FROM otp_codes WHERE ${column} = $1 ORDER BY created_at DESC LIMIT 1`,
    [hash]
  )).rows[0];
  if (!row) return { ok: false, error: 'no_code' };
  if (row.expired) return { ok: false, error: 'expired' };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, error: 'too_many_attempts' };
  if (row.code_hash !== pepperedHash(code)) {
    await pool.query(`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1`, [row.id]);
    return { ok: false, error: 'invalid_code' };
  }
  await pool.query(`DELETE FROM otp_codes WHERE ${column} = $1`, [hash]);
  return { ok: true };
}

/**
 * Verify a mobile OTP; find-or-create the user and return id/role.
 * @returns {Promise<{ok:boolean, userId?:string, role?:string, error?:string}>}
 */
async function verifyOtp(mobile, code) {
  if (!mobile || !code) return { ok: false, error: 'missing' };
  const pool = getPool();
  const mh = hashMobile(mobile);
  const c = await consumeCode('mobile_hash', mh, code);
  if (!c.ok) return c;
  let user = (await pool.query(`SELECT id, role FROM users WHERE mobile_hash = $1`, [mh])).rows[0];
  if (!user) {
    user = (await pool.query(
      `INSERT INTO users (role, mobile_hash) VALUES ('patient', $1) RETURNING id, role`, [mh]
    )).rows[0];
  }
  return { ok: true, userId: user.id, role: user.role };
}

/**
 * Verify an email OTP; find-or-create the user and return id/role.
 * @returns {Promise<{ok:boolean, userId?:string, role?:string, error?:string}>}
 */
async function verifyEmailOtp(email, code) {
  if (!email || !code) return { ok: false, error: 'missing' };
  const pool = getPool();
  const eh = hashEmail(email);
  const c = await consumeCode('email_hash', eh, code);
  if (!c.ok) return c;
  let user = (await pool.query(`SELECT id, role FROM users WHERE email_hash = $1`, [eh])).rows[0];
  if (!user) {
    user = (await pool.query(
      `INSERT INTO users (role, email_hash) VALUES ('patient', $1) RETURNING id, role`, [eh]
    )).rows[0];
  }
  return { ok: true, userId: user.id, role: user.role };
}

export { requestOtp, verifyOtp, requestEmailOtp, verifyEmailOtp, hashMobile, hashEmail };
