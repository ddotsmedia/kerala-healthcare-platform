// appointments.js — patient-side appointment data access. Parameterised SQL only.
// Patient identity comes from the session in Phase 2 auth; until then it is the
// PATIENT_DEMO_USER_ID env, falling back to the seeded 'Demo Patient'.

import { getPool } from '@khp/db';
import { getSession } from './session.js';

/** @returns {Promise<string|null>} authenticated user id (patient), or null. */
async function currentPatientId() {
  const s = getSession();
  return s ? s.userId : null;
}

/** Patient's appointments (upcoming first), with provider display. */
async function listMyAppointments(patientId) {
  if (!patientId) return [];
  try {
    const { rows } = await getPool().query(
      `SELECT a.id, a.booking_ref, a.slot_date, a.slot_start, a.slot_end,
              a.consultation_mode, a.status, a.consultation_room,
              d.display_name AS provider_name, d.slug AS provider_slug
         FROM appointments a
         JOIN doctors d ON d.id = a.provider_id
        WHERE a.patient_id = $1 AND a.deleted_at IS NULL
        ORDER BY a.slot_date DESC, a.slot_start DESC`,
      [patientId]
    );
    return rows;
  } catch (err) {
    console.error(`listMyAppointments failed: ${err.message}`);
    return [];
  }
}

/** One appointment owned by the patient. */
async function getMyAppointment(patientId, id) {
  const rows = (await getPool().query(
    `SELECT a.*, d.display_name AS provider_name, d.slug AS provider_slug
       FROM appointments a JOIN doctors d ON d.id = a.provider_id
      WHERE a.id = $1 AND a.patient_id = $2 AND a.deleted_at IS NULL`,
    [id, patientId]
  )).rows;
  return rows[0] || null;
}

/**
 * Patient cancels their own appointment, allowed up to 2h before the slot.
 * @returns {Promise<{ok:boolean, error?:string, appointment?:object}>}
 */
async function cancelByPatient(patientId, id, reason) {
  const pool = getPool();
  const cur = (await pool.query(
    `SELECT status, (slot_date + slot_start) > (now() + interval '2 hours') AS allowed
       FROM appointments WHERE id = $1 AND patient_id = $2 AND deleted_at IS NULL`,
    [id, patientId]
  )).rows[0];
  if (!cur) return { ok: false, error: 'not_found' };
  if (cur.status !== 'confirmed') return { ok: false, error: 'not_cancellable' };
  if (!cur.allowed) return { ok: false, error: 'too_late' };
  const { rows } = await pool.query(
    `UPDATE appointments
        SET status = 'cancelled', cancellation_reason = $3, cancelled_at = now(),
            cancelled_by = $2, updated_at = now()
      WHERE id = $1 AND patient_id = $2 AND status = 'confirmed'
      RETURNING id, booking_ref, status`,
    [id, patientId, reason || null]
  );
  return rows[0] ? { ok: true, appointment: rows[0] } : { ok: false, error: 'conflict' };
}

export { currentPatientId, listMyAppointments, getMyAppointment, cancelByPatient };
