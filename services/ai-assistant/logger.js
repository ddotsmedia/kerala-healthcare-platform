// logger.js — persist every AI interaction (hashed input, no raw text).

import { createHash } from 'node:crypto';
import { getPool } from '@khp/db';

async function logInteraction({ sessionId, input, responseLength, model, ragSourceIds, locale, flags }) {
  try {
    await getPool().query(
      `INSERT INTO ai_interaction_log
         (session_id, input_hash, response_length, model, rag_source_ids, locale, flags)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [sessionId || null, createHash('sha256').update(String(input || '')).digest('hex'),
       responseLength || 0, model || null, ragSourceIds || [], locale || 'ml', flags || []]);
  } catch (err) {
    console.error(`ai logInteraction failed: ${err.message}`);
  }
}

async function recentInteractions(sessionId, limit = 10) {
  try {
    const { rows } = await getPool().query(
      `SELECT id, response_length, model, locale, flags, created_at
         FROM ai_interaction_log WHERE session_id = $1
        ORDER BY created_at DESC LIMIT $2`, [sessionId, limit]);
    return rows;
  } catch { return []; }
}

/** Count a session's interactions in the last N minutes (rate limiting). */
async function interactionCount(sessionId, minutes = 60) {
  if (!sessionId) return 0;
  try {
    const { rows } = await getPool().query(
      `SELECT count(*)::int AS n FROM ai_interaction_log
        WHERE session_id = $1 AND created_at > now() - ($2 || ' minutes')::interval`,
      [sessionId, String(minutes)]);
    return rows[0].n;
  } catch { return 0; }
}

export { logInteraction, recentInteractions, interactionCount };
