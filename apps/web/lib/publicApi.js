// publicApi.js — X-API-Key auth + per-key rate limiting for /api/public/v1.
// Keys are high-entropy random tokens, stored as a SHA-256 hash (bcrypt is
// unnecessary for random keys and would add a dependency). Fire-and-forget
// usage tracking updates last_used_at + request_count.

import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { getPool } from '@khp/db';
import { rateLimit } from '@khp/ratelimit';

export const hashKey = (key) => crypto.createHash('sha256').update(String(key)).digest('hex');

function jsonError(msg, status) {
  return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status });
}

async function lookupKey(hash) {
  const { rows } = await getPool().query(
    `SELECT id, partner_name, partner_type, rate_limit_per_hour, allowed_endpoints
       FROM api_keys WHERE key_hash = $1 AND is_active = true AND deleted_at IS NULL LIMIT 1`,
    [hash]
  );
  return rows[0] || null;
}

function trackUsage(id) {
  getPool().query(`UPDATE api_keys SET last_used_at = now(), request_count = request_count + 1 WHERE id = $1`, [id])
    .catch((err) => console.error(`api key usage update failed: ${err.message}`));
}

/**
 * Wrap a public endpoint handler with API-key auth + rate limiting.
 * @param {Request} request
 * @param {string} endpoint short name (must be in allowed_endpoints, or that list is empty = all)
 * @param {(key:object)=>Promise<Response>} handler
 */
export async function withApiKey(request, endpoint, handler) {
  const key = request.headers.get('x-api-key');
  if (!key) return jsonError('missing_api_key', 401);
  const row = await lookupKey(hashKey(key));
  if (!row) return jsonError('invalid_api_key', 401);
  if (Array.isArray(row.allowed_endpoints) && row.allowed_endpoints.length > 0 && !row.allowed_endpoints.includes(endpoint)) {
    return jsonError('endpoint_not_allowed', 403);
  }
  const rl = rateLimit(`apikey:${row.id}`, row.rate_limit_per_hour || 1000, 3600);
  if (!rl.allowed) {
    return NextResponse.json({ data: null, meta: null, errors: ['rate_limit_exceeded'], retryAfter: rl.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter), 'X-RateLimit-Remaining': '0' } });
  }
  trackUsage(row.id);
  const res = await handler(row);
  res.headers.set('X-RateLimit-Limit', String(row.rate_limit_per_hour || 1000));
  res.headers.set('X-RateLimit-Remaining', String(rl.remaining));
  return res;
}
