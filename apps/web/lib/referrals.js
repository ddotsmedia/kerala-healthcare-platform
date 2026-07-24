// referrals.js — refer-a-friend growth loop. Each user has one canonical code;
// every friend who registers with it gets a child row. Parameterised SQL, fails soft.

import { randomBytes } from 'node:crypto';
import { getPool } from '@khp/db';

const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 — read-aloud safe
const CODE_LENGTH = 8;
const CHILD_SUFFIX_BYTES = 3;
const JOINED = ['registered', 'appointed', 'rewarded'];
const BOOKED = ['appointed', 'rewarded'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`referrals query failed: ${err.message}`); return []; }
}

function newCode() {
  const bytes = randomBytes(CODE_LENGTH);
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i += 1) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

/** Canonical shareable code for a user — created on first visit. */
export async function myCode(userId) {
  const existing = await run(
    `SELECT referral_code FROM referrals
      WHERE referrer_id = $1 AND referred_user_id IS NULL AND deleted_at IS NULL
      ORDER BY created_at ASC LIMIT 1`, [userId]);
  if (existing[0]) return existing[0].referral_code;
  const rows = await run(
    `INSERT INTO referrals (referrer_id, referral_code) VALUES ($1, $2)
     ON CONFLICT (referral_code) DO NOTHING RETURNING referral_code`, [userId, newCode()]);
  return rows[0] ? rows[0].referral_code : null;
}

/** @returns {Promise<{joined:number, booked:number, shared:number}>} */
export async function myStats(userId) {
  const rows = await run(
    `SELECT status, count(*)::int AS n FROM referrals
      WHERE referrer_id = $1 AND referred_user_id IS NOT NULL AND deleted_at IS NULL
      GROUP BY status`, [userId]);
  const by = {};
  for (const r of rows) by[r.status] = r.n;
  const sum = (keys) => keys.reduce((t, k) => t + (by[k] || 0), 0);
  return { joined: sum(JOINED), booked: sum(BOOKED), shared: by.shared || 0 };
}

/** Recent friends referred by this user (no PII — status + date only). */
export function myReferrals(userId, limit = 20) {
  return run(
    `SELECT id, status, created_at FROM referrals
      WHERE referrer_id = $1 AND referred_user_id IS NOT NULL AND deleted_at IS NULL
      ORDER BY created_at DESC LIMIT $2`, [userId, limit]);
}

/**
 * Link a newly registered user to the referrer behind `code`.
 * `emailHash` is already hashed by the caller — never store plaintext email.
 * @returns {Promise<boolean>} true when the referral was recorded
 */
export async function trackRegistration(code, newUserId, emailHash) {
  const clean = String(code || '').trim().toUpperCase().slice(0, 20);
  if (!clean || !newUserId) return false;
  const owner = await run(
    `SELECT referrer_id FROM referrals
      WHERE referral_code = $1 AND referred_user_id IS NULL AND deleted_at IS NULL`, [clean]);
  const referrerId = owner[0] && owner[0].referrer_id;
  if (!referrerId || referrerId === newUserId) return false; // unknown code or self-referral
  const rows = await run(
    `INSERT INTO referrals (referrer_id, referral_code, referred_email, referred_user_id, status)
     SELECT $1, $2, $3, $4, 'registered'
      WHERE NOT EXISTS (SELECT 1 FROM referrals WHERE referred_user_id = $4 AND deleted_at IS NULL)
     ON CONFLICT (referral_code) DO NOTHING
     RETURNING id`,
    [referrerId, `${clean}-${randomBytes(CHILD_SUFFIX_BYTES).toString('hex')}`, emailHash || null, newUserId]);
  return rows.length > 0;
}

/** Promote a referred user's row to 'appointed' once they book. Safe to call always. */
export function markAppointed(userId) {
  if (!userId) return Promise.resolve(false);
  return run(
    `UPDATE referrals SET status = 'appointed', updated_at = now()
      WHERE referred_user_id = $1 AND status = 'registered' AND deleted_at IS NULL`,
    [userId]).then(() => true);
}
