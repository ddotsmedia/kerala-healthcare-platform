// otp.js — OTP generation + verification. Codes are stored hashed in Postgres
// with a short TTL; delivery goes through the SMS service.

import { getPool } from '@khp/db';
import { sendSms } from '@khp/notifications';
import { pepperedHash, sixDigitCode } from './crypto.js';

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;

function hashMobile(mobile) {
  return pepperedHash(String(mobile).trim());
}

/**
 * Generate + send an OTP for a mobile number.
 * @returns {Promise<{ok:boolean, debugCode?:string}>}
 */
async function requestOtp(mobile) {
  if (!mobile) return { ok: false };
  const pool = getPool();
  const mh = hashMobile(mobile);
  const code = sixDigitCode();
  await pool.query(`DELETE FROM otp_codes WHERE mobile_hash = $1`, [mh]);
  await pool.query(
    `INSERT INTO otp_codes (mobile_hash, code_hash, expires_at)
     VALUES ($1, $2, now() + interval '${OTP_TTL_MINUTES} minutes')`,
    [mh, pepperedHash(code)]
  );
  await sendSms(mobile, `Kerala Health Portal OTP: ${code} (valid ${OTP_TTL_MINUTES} min)`);
  // debugCode only surfaced when explicitly enabled (never in production).
  return { ok: true, debugCode: process.env.AUTH_OTP_DEBUG === '1' ? code : undefined };
}

/**
 * Verify an OTP; on success find-or-create the user and return their id/role.
 * @returns {Promise<{ok:boolean, userId?:string, role?:string, error?:string}>}
 */
async function verifyOtp(mobile, code) {
  if (!mobile || !code) return { ok: false, error: 'missing' };
  const pool = getPool();
  const mh = hashMobile(mobile);
  const row = (await pool.query(
    `SELECT id, code_hash, attempts, expires_at < now() AS expired
       FROM otp_codes WHERE mobile_hash = $1 ORDER BY created_at DESC LIMIT 1`,
    [mh]
  )).rows[0];
  if (!row) return { ok: false, error: 'no_code' };
  if (row.expired) return { ok: false, error: 'expired' };
  if (row.attempts >= MAX_ATTEMPTS) return { ok: false, error: 'too_many_attempts' };
  if (row.code_hash !== pepperedHash(code)) {
    await pool.query(`UPDATE otp_codes SET attempts = attempts + 1 WHERE id = $1`, [row.id]);
    return { ok: false, error: 'invalid_code' };
  }
  await pool.query(`DELETE FROM otp_codes WHERE mobile_hash = $1`, [mh]);

  let user = (await pool.query(`SELECT id, role FROM users WHERE mobile_hash = $1`, [mh])).rows[0];
  if (!user) {
    user = (await pool.query(
      `INSERT INTO users (role, mobile_hash) VALUES ('patient', $1) RETURNING id, role`, [mh]
    )).rows[0];
  }
  return { ok: true, userId: user.id, role: user.role };
}

export { requestOtp, verifyOtp, hashMobile };
