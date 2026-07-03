// reviews.js — admin moderation data access. Parameterised SQL only. Fails soft.

import { getPool } from '@khp/db';

const PAGE_SIZE = 20;

async function run(text, values = []) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`admin reviews query failed: ${err.message}`); return []; }
}

/** Reviews by status (oldest first for the queue), with entity + patient names. */
export function listReviewsByStatus(status = 'pending', page = 1) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  return run(
    `SELECT r.id, r.entity_type, r.entity_id, r.rating, r.title, r.body,
            r.status, r.created_at, r.rejection_reason, r.is_anonymous,
            u.full_name AS patient_name,
            CASE WHEN r.entity_type = 'doctor' THEN d.display_name ELSE h.name_en END AS entity_name
       FROM reviews r
       JOIN users u ON u.id = r.patient_id
       LEFT JOIN doctors d ON r.entity_type = 'doctor' AND d.id = r.entity_id
       LEFT JOIN hospitals h ON r.entity_type = 'hospital' AND h.id = r.entity_id
      WHERE r.status = $1 AND r.deleted_at IS NULL
      ORDER BY r.created_at ASC
      LIMIT ${PAGE_SIZE} OFFSET ${(p - 1) * PAGE_SIZE}`,
    [status]
  );
}

/** Count per status (for tab badges). */
export async function reviewStatusCounts() {
  const rows = await run(
    `SELECT status, count(*)::int AS n FROM reviews WHERE deleted_at IS NULL GROUP BY status`
  );
  const out = { pending: 0, approved: 0, rejected: 0, flagged: 0 };
  for (const r of rows) if (r.status in out) out[r.status] = r.n;
  return out;
}

export async function approveReview(id, adminId) {
  const rows = await run(
    `UPDATE reviews SET status = 'approved', moderated_by = $2, moderated_at = now(),
            rejection_reason = NULL, updated_at = now()
      WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id, adminId]
  );
  return rows.length > 0;
}

export async function rejectReview(id, adminId, reason) {
  const rows = await run(
    `UPDATE reviews SET status = 'rejected', moderated_by = $2, moderated_at = now(),
            rejection_reason = $3, updated_at = now()
      WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id, adminId, reason || null]
  );
  return rows.length > 0;
}
