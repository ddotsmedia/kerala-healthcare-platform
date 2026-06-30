// schedule.js — doctor-side appointment + availability data access.
// Provider identity = the logged-in doctor (PORTAL_DEMO_DOCTOR_ID until Phase 2).
// Parameterised SQL only.

import { getPool } from '@khp/db';
import { toMinutes, toTime } from '@khp/appointments';

const SLOT_DEFAULT_MIN = 30;

/** Appointments for a provider on a date (default today), with patient name. */
async function getSchedule(providerId, date) {
  if (!providerId) return [];
  const day = date || new Date().toISOString().slice(0, 10);
  try {
    const { rows } = await getPool().query(
      `SELECT a.id, a.booking_ref, a.slot_start, a.slot_end, a.consultation_mode,
              a.status, a.consultation_room, a.notes_for_doctor,
              u.full_name AS patient_name
         FROM appointments a
         LEFT JOIN users u ON u.id = a.patient_id
        WHERE a.provider_id = $1 AND a.slot_date = $2 AND a.deleted_at IS NULL
        ORDER BY a.slot_start`,
      [providerId, day]
    );
    return { date: day, appointments: rows };
  } catch (err) {
    console.error(`getSchedule failed: ${err.message}`);
    return { date: day, appointments: [] };
  }
}

/** Full appointment history for a provider, optional status filter. */
async function listProviderAppointments(providerId, status) {
  const where = ['a.provider_id = $1', 'a.deleted_at IS NULL'];
  const values = [providerId];
  if (status) { values.push(status); where.push(`a.status = $${values.length}`); }
  const { rows } = await getPool().query(
    `SELECT a.id, a.booking_ref, a.slot_date, a.slot_start, a.status, a.consultation_mode,
            u.full_name AS patient_name
       FROM appointments a LEFT JOIN users u ON u.id = a.patient_id
      WHERE ${where.join(' AND ')}
      ORDER BY a.slot_date DESC, a.slot_start DESC`,
    values
  );
  return rows;
}

/** Doctor marks an appointment completed. */
async function completeAppointment(providerId, id) {
  const { rows } = await getPool().query(
    `UPDATE appointments SET status = 'completed', updated_at = now()
      WHERE id = $1 AND provider_id = $2 AND status = 'confirmed'
      RETURNING id, status`,
    [id, providerId]
  );
  return rows[0] ? { ok: true, appointment: rows[0] } : { ok: false, error: 'not_completable' };
}

/** Doctor cancels (any time). */
async function cancelByDoctor(providerId, id, reason) {
  const { rows } = await getPool().query(
    `UPDATE appointments
        SET status = 'cancelled', cancellation_reason = $3, cancelled_at = now(), updated_at = now()
      WHERE id = $1 AND provider_id = $2 AND status = 'confirmed'
      RETURNING id, status`,
    [id, providerId, reason || null]
  );
  return rows[0] ? { ok: true, appointment: rows[0] } : { ok: false, error: 'not_cancellable' };
}

/**
 * Doctor reschedules to a new slot. Respects the confirmed-slot unique index.
 * @returns {Promise<{ok:boolean, error?:string, appointment?:object}>}
 */
async function rescheduleAppointment(providerId, id, newDate, newStart) {
  const newEnd = toTime(toMinutes(newStart) + SLOT_DEFAULT_MIN);
  try {
    const { rows } = await getPool().query(
      `UPDATE appointments
          SET slot_date = $3, slot_start = $4, slot_end = $5, updated_at = now()
        WHERE id = $1 AND provider_id = $2 AND status = 'confirmed'
        RETURNING id, slot_date, slot_start, slot_end, status`,
      [id, providerId, newDate, newStart, newEnd]
    );
    return rows[0] ? { ok: true, appointment: rows[0] } : { ok: false, error: 'not_reschedulable' };
  } catch (err) {
    if (/uq_appt_provider_slot_confirmed/.test(err.message)) return { ok: false, error: 'slot_taken' };
    return { ok: false, error: err.message };
  }
}

export {
  getSchedule, listProviderAppointments, completeAppointment,
  cancelByDoctor, rescheduleAppointment
};
