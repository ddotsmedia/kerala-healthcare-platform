// reviews.js — patient-side review data access. Parameterised SQL only. Fails soft.

import { getPool } from '@khp/db';

const PAGE_SIZE = 10;
const ENTITY_TYPES = ['doctor', 'hospital'];

export function isValidEntityType(t) { return ENTITY_TYPES.includes(t); }

async function run(text, values = []) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`reviews query failed: ${err.message}`); return []; }
}

/** Approved reviews for an entity, paginated (10/page). */
export function listApprovedReviews(entityType, entityId, page = 1) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  return run(
    `SELECT r.id, r.rating, r.title, r.body, r.is_anonymous, r.appointment_id, r.created_at,
            CASE WHEN r.is_anonymous THEN NULL ELSE u.full_name END AS patient_name
       FROM reviews r JOIN users u ON u.id = r.patient_id
      WHERE r.entity_type = $1 AND r.entity_id = $2
        AND r.status = 'approved' AND r.deleted_at IS NULL
      ORDER BY r.created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${(p - 1) * PAGE_SIZE}`,
    [entityType, entityId]
  );
}

/** Summary: avg_rating, total_count, distribution {5..1}. */
export async function reviewSummary(entityType, entityId) {
  const rows = await run(
    `SELECT rating, count(*)::int AS n FROM reviews
      WHERE entity_type = $1 AND entity_id = $2 AND status = 'approved' AND deleted_at IS NULL
      GROUP BY rating`,
    [entityType, entityId]
  );
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let total = 0, sum = 0;
  for (const r of rows) { distribution[r.rating] = r.n; total += r.n; sum += r.rating * r.n; }
  return { avg_rating: total ? Math.round((sum / total) * 10) / 10 : 0, total_count: total, distribution };
}

/**
 * Create a pending review. One per patient per entity.
 * @returns {Promise<{ok:boolean, id?:string, error?:string}>}
 */
export async function createReview({ entityType, entityId, patientId, rating, title, body, isAnonymous, appointmentId }) {
  try {
    const rows = await getPool().query(
      `INSERT INTO reviews (entity_type, entity_id, patient_id, appointment_id, rating, title, body, is_anonymous, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'pending')
       ON CONFLICT (entity_type, entity_id, patient_id) DO NOTHING
       RETURNING id`,
      [entityType, entityId, patientId, appointmentId || null, rating, title || null, body || null, !!isAnonymous]
    );
    if (rows.rowCount === 0) return { ok: false, error: 'already_reviewed' };
    return { ok: true, id: rows.rows[0].id };
  } catch (err) {
    console.error(`createReview failed: ${err.message}`);
    return { ok: false, error: 'create_failed' };
  }
}

/** Edit own PENDING review (title/body/rating/is_anonymous only). */
export async function updateOwnReview(id, patientId, { rating, title, body, isAnonymous }) {
  const rows = await run(
    `UPDATE reviews SET rating = COALESCE($3, rating), title = $4, body = $5,
            is_anonymous = COALESCE($6, is_anonymous), updated_at = now()
      WHERE id = $1 AND patient_id = $2 AND status = 'pending' AND deleted_at IS NULL
      RETURNING id`,
    [id, patientId, rating ?? null, title ?? null, body ?? null, typeof isAnonymous === 'boolean' ? isAnonymous : null]
  );
  return rows.length > 0;
}

/** Soft-delete own review (trigger recalculates cache). */
export async function deleteOwnReview(id, patientId) {
  const rows = await run(
    `UPDATE reviews SET deleted_at = now(), updated_at = now()
      WHERE id = $1 AND patient_id = $2 AND deleted_at IS NULL RETURNING id, entity_type, entity_id`,
    [id, patientId]
  );
  return rows.length > 0;
}

/** In-app notification to every platform_admin about a new review. */
export async function notifyAdminsNewReview(entityType) {
  try {
    await getPool().query(
      `INSERT INTO notifications (user_id, type, title, body)
       SELECT id, 'review_pending', 'New review pending', $1 FROM users WHERE role = 'platform_admin'`,
      [`A new ${entityType} review is awaiting moderation.`]
    );
  } catch (err) { console.error(`notifyAdmins failed: ${err.message}`); }
}
