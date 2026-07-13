// refills.js — doctor-side refill request queue + decisions. Doctor-scoped.
// Approving creates a new prescription for the patient and notifies them.

import { getPool } from '@khp/db';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`portal refills query failed: ${err.message}`); return []; }
}

async function listRefills(doctorId, status) {
  if (!doctorId) return [];
  const s = ['pending', 'approved', 'rejected', 'dispatched'].includes(status) ? status : 'pending';
  return run(
    `SELECT r.id, r.patient_id, r.medications_requested, r.reason, r.urgency, r.status,
            r.doctor_notes, r.new_prescription_id, r.created_at, r.original_prescription_id,
            u.full_name AS patient_name
       FROM refill_requests r
       LEFT JOIN users u ON u.id = r.patient_id
      WHERE r.doctor_id = $1 AND r.status = $2
      ORDER BY CASE r.urgency WHEN 'urgent' THEN 0 WHEN 'soon' THEN 1 ELSE 2 END, r.created_at ASC`,
    [doctorId, s]);
}

async function statusCounts(doctorId) {
  if (!doctorId) return {};
  const rows = await run(`SELECT status, count(*)::int AS n FROM refill_requests WHERE doctor_id = $1 GROUP BY status`, [doctorId]);
  return Object.fromEntries(rows.map((r) => [r.status, r.n]));
}

async function notify(patientId, type, title, body) {
  await run(`INSERT INTO notifications (user_id, type, title, body) VALUES ($1,$2,$3,$4)`, [patientId, type, title, body]);
}

/** Approve (creates a prescription), reject, or dispatch. Doctor-owned + pending only. */
async function decideRefill(doctorId, id, status, doctorNotes) {
  if (!doctorId || !['approved', 'rejected', 'dispatched'].includes(status)) return { ok: false };
  const rows = await run(
    `SELECT id, patient_id, medications_requested, original_prescription_id
       FROM refill_requests WHERE id = $1 AND doctor_id = $2 AND status = 'pending'`, [id, doctorId]);
  const req = rows[0];
  if (!req) return { ok: false, error: 'not_found' };

  let newRxId = null;
  if (status === 'approved') {
    const doc = await run(`SELECT display_name FROM doctors WHERE id = $1`, [doctorId]);
    const docName = doc[0] ? doc[0].display_name : null;
    const rx = await run(
      `INSERT INTO prescriptions (user_id, doctor_id, doctor_name, prescribed_date, medications, notes)
       VALUES ($1,$2,$3,current_date,$4::jsonb,$5) RETURNING id`,
      [req.patient_id, doctorId, docName, JSON.stringify(req.medications_requested || []),
       doctorNotes ? String(doctorNotes).slice(0, 1000) : 'Refill approved']);
    newRxId = rx[0] ? rx[0].id : null;
  }

  await run(
    `UPDATE refill_requests SET status = $2, doctor_notes = $3, new_prescription_id = $4, updated_at = now()
      WHERE id = $1`, [id, status, doctorNotes ? String(doctorNotes).slice(0, 1000) : null, newRxId]);

  const title = status === 'approved' ? 'Refill approved' : status === 'rejected' ? 'Refill rejected' : 'Refill dispatched';
  const body = status === 'approved' ? 'Your prescription refill was approved. A new prescription is available.'
    : status === 'rejected' ? 'Your refill request was not approved. Please book a consultation.'
    : 'Your refill has been dispatched.';
  await notify(req.patient_id, `refill_${status}`, title, body);
  return { ok: true, newPrescriptionId: newRxId };
}

export { listRefills, statusCounts, decideRefill };
