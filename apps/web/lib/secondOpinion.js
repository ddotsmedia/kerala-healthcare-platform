// secondOpinion.js — patient second-opinion requests. User-scoped. Fails soft.

import { getPool } from '@khp/db';

const URGENCY = ['routine', 'soon', 'urgent'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`second-opinion query failed: ${err.message}`); return []; }
}

const SELECT = `SELECT r.id, r.condition_description, r.existing_diagnosis, r.existing_treatment,
  r.urgency, r.status, r.documents, r.created_at, r.preferred_specialty_id, r.preferred_district_id,
  sp.name_ml AS specialty_ml, sp.name_en AS specialty_en,
  di.name_ml AS district_ml, di.name_en AS district_en,
  md.display_name AS matched_doctor_name, md.slug AS matched_doctor_slug,
  md.consultation_fee AS matched_doctor_fee
  FROM second_opinion_requests r
  LEFT JOIN specialties sp ON sp.id = r.preferred_specialty_id
  LEFT JOIN districts di ON di.id = r.preferred_district_id
  LEFT JOIN doctors md ON md.id = r.matched_doctor_id`;

async function createRequest(userId, b) {
  if (!userId || !b.condition_description) return null;
  const docs = Array.isArray(b.documents) ? b.documents.filter((d) => d).slice(0, 20).map(String) : [];
  const urgency = URGENCY.includes(b.urgency) ? b.urgency : 'routine';
  const rows = await run(
    `INSERT INTO second_opinion_requests
       (patient_id, condition_description, existing_diagnosis, existing_treatment, urgency,
        preferred_specialty_id, preferred_district_id, documents)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb)
     RETURNING id`,
    [userId, String(b.condition_description).slice(0, 3000), b.existing_diagnosis || null,
     b.existing_treatment || null, urgency, b.preferred_specialty_id || null,
     b.preferred_district_id || null, JSON.stringify(docs)]);
  return rows[0] || null;
}

async function listMyRequests(userId) {
  if (!userId) return [];
  return run(`${SELECT} WHERE r.patient_id = $1 ORDER BY r.created_at DESC`, [userId]);
}

async function getMyRequest(userId, id) {
  if (!userId) return null;
  const rows = await run(`${SELECT} WHERE r.id = $1 AND r.patient_id = $2`, [id, userId]);
  return rows[0] || null;
}

/** Patient can cancel their own open/matched request. */
async function cancelRequest(userId, id) {
  if (!userId) return null;
  const rows = await run(
    `UPDATE second_opinion_requests SET status = 'cancelled', updated_at = now()
      WHERE id = $1 AND patient_id = $2 AND status IN ('open','matched') RETURNING id`, [id, userId]);
  return rows[0] || false;
}

export { createRequest, listMyRequests, getMyRequest, cancelRequest, URGENCY };
