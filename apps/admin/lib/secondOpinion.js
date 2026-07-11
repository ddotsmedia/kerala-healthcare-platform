// secondOpinion.js — admin second-opinion queue + matching. platform_admin only.

import { getPool } from '@khp/db';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`admin second-opinion query failed: ${err.message}`); return []; }
}

const SELECT = `SELECT r.id, r.condition_description, r.existing_diagnosis, r.existing_treatment,
  r.urgency, r.status, r.documents, r.created_at, r.preferred_specialty_id, r.preferred_district_id,
  r.matched_doctor_id,
  sp.name_en AS specialty_en, di.name_en AS district_en,
  md.display_name AS matched_doctor_name,
  u.full_name AS patient_name
  FROM second_opinion_requests r
  LEFT JOIN specialties sp ON sp.id = r.preferred_specialty_id
  LEFT JOIN districts di ON di.id = r.preferred_district_id
  LEFT JOIN doctors md ON md.id = r.matched_doctor_id
  LEFT JOIN users u ON u.id = r.patient_id`;

async function listRequestsByStatus(status) {
  const s = ['open', 'matched', 'completed', 'cancelled'].includes(status) ? status : 'open';
  return run(`${SELECT} WHERE r.status = $1 ORDER BY
                CASE r.urgency WHEN 'urgent' THEN 0 WHEN 'soon' THEN 1 ELSE 2 END, r.created_at ASC`, [s]);
}

async function statusCounts() {
  const rows = await run(`SELECT status, count(*)::int AS n FROM second_opinion_requests GROUP BY status`, []);
  return Object.fromEntries(rows.map((r) => [r.status, r.n]));
}

/** Auto-suggest: verified, published doctors matching specialty (+ district). */
async function suggestDoctors(specialtyId, districtId, limit = 8) {
  const where = ["d.listing_status = 'published'", "d.verification_status = 'verified'", 'd.deleted_at IS NULL'];
  const values = [];
  if (specialtyId) { values.push(specialtyId); where.push(`d.specialty_id = $${values.length}`); }
  if (districtId) { values.push(districtId); where.push(`d.district_id = $${values.length}`); }
  values.push(limit);
  return run(
    `SELECT d.id, d.display_name, d.slug, d.consultation_fee, d.rating_avg, d.rating_count,
            s.name_en AS specialty_en, di.name_en AS district_en
       FROM doctors d
       LEFT JOIN specialties s ON s.id = d.specialty_id
       LEFT JOIN districts di ON di.id = d.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY d.rating_avg DESC NULLS LAST, d.rating_count DESC
      LIMIT $${values.length}`, values);
}

/** Match a request to a doctor; notify the patient in-app. */
async function matchRequest(requestId, doctorId) {
  if (!requestId || !doctorId) return { ok: false };
  const rows = await run(
    `UPDATE second_opinion_requests SET matched_doctor_id = $2, status = 'matched', updated_at = now()
      WHERE id = $1 AND status = 'open'
    RETURNING patient_id`, [requestId, doctorId]);
  if (!rows[0]) return { ok: false, error: 'not_open' };
  const doc = await run(`SELECT display_name FROM doctors WHERE id = $1`, [doctorId]);
  const name = doc[0] ? doc[0].display_name : 'a specialist';
  await run(
    `INSERT INTO notifications (user_id, type, title, body)
     VALUES ($1, 'second_opinion_matched', $2, $3)`,
    [rows[0].patient_id, 'Second opinion matched', `Your second-opinion request was matched with ${name}. You can now book an appointment.`]);
  return { ok: true };
}

export { listRequestsByStatus, statusCounts, suggestDoctors, matchRequest };
