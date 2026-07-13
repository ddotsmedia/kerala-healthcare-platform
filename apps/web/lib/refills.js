// refills.js — patient prescription-refill requests. User-scoped. Fails soft.

import { getPool } from '@khp/db';

const URGENCY = ['routine', 'soon', 'urgent'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`refills query failed: ${err.message}`); return []; }
}

/** Doctors the patient has consulted (for the refill's target doctor). */
async function listMyDoctors(userId) {
  if (!userId) return [];
  return run(
    `SELECT DISTINCT d.id, d.display_name, d.slug
       FROM appointments a JOIN doctors d ON d.id = a.provider_id
      WHERE a.patient_id = $1 AND a.deleted_at IS NULL
      ORDER BY d.display_name`, [userId]);
}

function cleanMeds(meds) {
  if (!Array.isArray(meds)) return [];
  return meds.filter((m) => m && m.name).slice(0, 50).map((m) => ({
    name: String(m.name).slice(0, 120), dosage: m.dosage ? String(m.dosage).slice(0, 60) : '',
    frequency: m.frequency ? String(m.frequency).slice(0, 60) : '', duration: m.duration ? String(m.duration).slice(0, 60) : ''
  }));
}

async function createRefillRequest(userId, b) {
  if (!userId || !b.doctor_id) return null;
  const meds = cleanMeds(b.medications_requested);
  if (!meds.length) return null;
  const urgency = URGENCY.includes(b.urgency) ? b.urgency : 'routine';
  const rows = await run(
    `INSERT INTO refill_requests
       (patient_id, doctor_id, original_prescription_id, medications_requested, reason, urgency)
     VALUES ($1,$2,$3,$4::jsonb,$5,$6) RETURNING id`,
    [userId, b.doctor_id, b.original_prescription_id || null, JSON.stringify(meds),
     b.reason ? String(b.reason).slice(0, 1000) : null, urgency]);
  return rows[0] || null;
}

async function listMyRefillRequests(userId) {
  if (!userId) return [];
  return run(
    `SELECT r.id, r.medications_requested, r.reason, r.urgency, r.status, r.doctor_notes,
            r.new_prescription_id, r.created_at, d.display_name AS doctor_name
       FROM refill_requests r JOIN doctors d ON d.id = r.doctor_id
      WHERE r.patient_id = $1 ORDER BY r.created_at DESC`, [userId]);
}

export { listMyDoctors, createRefillRequest, listMyRefillRequests, URGENCY };
