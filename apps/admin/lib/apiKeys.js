// apiKeys.js — issue / list / revoke partner API keys. Keys are shown in
// plaintext only once at creation; only a SHA-256 hash is stored.

import crypto from 'node:crypto';
import { getPool } from '@khp/db';

const PARTNER_TYPES = ['hospital', 'insurance', 'government', 'developer'];
const hashKey = (key) => crypto.createHash('sha256').update(String(key)).digest('hex');

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}

/** Generate a new key, store its hash, return the plaintext once. */
export async function createKey({ name, partnerName, partnerType, rateLimit, allowedEndpoints } = {}) {
  const nm = String(name || '').trim();
  const partner = String(partnerName || '').trim();
  if (!nm || !partner) return { error: 'name_and_partner_required' };
  const type = PARTNER_TYPES.includes(partnerType) ? partnerType : 'developer';
  const rl = Math.max(1, Math.min(1000000, parseInt(rateLimit, 10) || 1000));
  const endpoints = String(allowedEndpoints || '').split(',').map((s) => s.trim()).filter(Boolean);

  const secret = crypto.randomBytes(24).toString('hex');
  const key = `khp_live_${secret}`;
  const prefix = key.slice(0, 16);
  const [r] = await rows(
    `INSERT INTO api_keys (name, key_hash, key_prefix, partner_name, partner_type, rate_limit_per_hour, allowed_endpoints)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [nm, hashKey(key), prefix, partner, type, rl, endpoints]
  );
  return { id: r.id, key };
}

export function listKeys() {
  return rows(
    `SELECT id, name, key_prefix, partner_name, partner_type, rate_limit_per_hour,
            allowed_endpoints, is_active, request_count, last_used_at, created_at
       FROM api_keys WHERE deleted_at IS NULL ORDER BY created_at DESC`
  );
}

export async function revokeKey(id) {
  const r = await rows(
    `UPDATE api_keys SET is_active = false, updated_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id]
  );
  return r.length ? { id: r[0].id } : { error: 'not_found' };
}

export async function reactivateKey(id) {
  const r = await rows(
    `UPDATE api_keys SET is_active = true, updated_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id]
  );
  return r.length ? { id: r[0].id } : { error: 'not_found' };
}

export { PARTNER_TYPES };
