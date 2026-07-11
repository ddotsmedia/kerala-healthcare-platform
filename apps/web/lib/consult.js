// consult.js — video consultation access + lifecycle. A consult room is visible
// only to its patient or its doctor. Parameterised SQL; fails soft.

import { getPool } from '@khp/db';
import { getSession } from './session.js';
import { jitsiRoomName, jitsiUrl, startConsultation, endConsultation } from '@khp/appointments';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`consult query failed: ${err.message}`); return []; }
}

/** Resolve a room to its appointment + the viewer's role, if authorised. */
async function getConsultAppointment(roomId) {
  const s = await getSession();
  if (!s || !roomId) return null;
  const rows = await run(
    `SELECT a.id, a.booking_ref, a.slot_date, a.slot_start, a.slot_end, a.consultation_mode,
            a.consultation_room, a.jitsi_room_name, a.status, a.patient_id,
            a.consultation_started_at, a.consultation_ended_at,
            d.user_id AS doctor_user_id, d.display_name AS provider_name, d.slug AS provider_slug,
            u.full_name AS patient_name
       FROM appointments a
       JOIN doctors d ON d.id = a.provider_id
       LEFT JOIN users u ON u.id = a.patient_id
      WHERE a.consultation_room = $1 AND a.deleted_at IS NULL`, [roomId]);
  const a = rows[0];
  if (!a) return null;
  const isPatient = a.patient_id === s.userId;
  const isDoctor = a.doctor_user_id === s.userId;
  if (!isPatient && !isDoctor) return null;
  return {
    ...a, role: isDoctor ? 'doctor' : 'patient',
    displayName: isDoctor ? a.provider_name : (a.patient_name || 'Patient'),
    roomName: jitsiRoomName(a), jitsiUrl: jitsiUrl(jitsiRoomName(a))
  };
}

/** Authorise the session for an appointment and return its role, else null. */
async function authForAppointment(appointmentId) {
  const s = await getSession();
  if (!s) return null;
  const rows = await run(
    `SELECT a.patient_id, d.user_id AS doctor_user_id FROM appointments a
       JOIN doctors d ON d.id = a.provider_id WHERE a.id = $1 AND a.deleted_at IS NULL`, [appointmentId]);
  const a = rows[0];
  if (!a) return null;
  if (a.patient_id === s.userId) return 'patient';
  if (a.doctor_user_id === s.userId) return 'doctor';
  return null;
}

async function startConsult(appointmentId) {
  const role = await authForAppointment(appointmentId);
  if (!role) return { ok: false, error: 'forbidden' };
  return startConsultation(appointmentId);
}

async function endConsult(appointmentId) {
  const role = await authForAppointment(appointmentId);
  if (!role) return { ok: false, error: 'forbidden' };
  return endConsultation(appointmentId, role);
}

export { getConsultAppointment, startConsult, endConsult };
