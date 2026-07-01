// refresh.js — opaque refresh tokens with rotation, stored hashed in Postgres.

import { getPool } from '@khp/db';
import { sha256hex, opaqueToken } from './crypto.js';

const REFRESH_TTL_DAYS = 30;

/** Issue a new refresh token for a user. @returns {Promise<string>} the raw token. */
async function issueRefresh(userId) {
  const token = opaqueToken(32);
  await getPool().query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + interval '${REFRESH_TTL_DAYS} days')`,
    [userId, sha256hex(token)]
  );
  return token;
}

/**
 * Rotate a refresh token: revoke the presented one, issue a fresh one.
 * @returns {Promise<{ok:boolean, userId?:string, role?:string, token?:string, error?:string}>}
 */
async function rotateRefresh(token) {
  if (!token) return { ok: false, error: 'no_token' };
  const pool = getPool();
  const row = (await pool.query(
    `SELECT rt.id, rt.user_id, u.role, (rt.expires_at < now()) AS expired, rt.revoked_at
       FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id
      WHERE rt.token_hash = $1`,
    [sha256hex(token)]
  )).rows[0];
  if (!row || row.revoked_at) return { ok: false, error: 'invalid' };
  if (row.expired) return { ok: false, error: 'expired' };
  await pool.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1`, [row.id]);
  const fresh = await issueRefresh(row.user_id);
  return { ok: true, userId: row.user_id, role: row.role, token: fresh };
}

/** Revoke a refresh token (logout). */
async function revokeRefresh(token) {
  if (!token) return;
  await getPool().query(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL`,
    [sha256hex(token)]
  );
}

export { issueRefresh, rotateRefresh, revokeRefresh, REFRESH_TTL_DAYS };
