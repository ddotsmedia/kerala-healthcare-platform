// chat.js — patient side of the doctor↔patient chat. Only for the patient's own
// COMPLETED appointment. Parameterised SQL; fails soft.

import { getPool } from '@khp/db';
import { currentPatientId } from './appointments.js';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`chat query failed: ${err.message}`); return []; }
}

/** Verify the appointment belongs to this patient + is completed. */
async function patientChatContext(uid, appointmentId) {
  const rows = await run(
    `SELECT a.id, a.status, a.booking_ref, d.display_name AS provider_name, d.user_id AS doctor_user_id
       FROM appointments a JOIN doctors d ON d.id = a.provider_id
      WHERE a.id = $1 AND a.patient_id = $2 AND a.deleted_at IS NULL`, [appointmentId, uid]);
  return rows[0] || null;
}

async function listMessages(appointmentId) {
  return run(`SELECT id, sender_id, sender_role, message, is_read, created_at
                FROM doctor_patient_messages WHERE appointment_id = $1 ORDER BY created_at ASC`, [appointmentId]);
}

/** Load the thread for the patient; marks doctor messages as read. */
async function getPatientChat(appointmentId) {
  const uid = await currentPatientId();
  if (!uid) return { error: 'unauthenticated' };
  const ctx = await patientChatContext(uid, appointmentId);
  if (!ctx) return { error: 'not_found' };
  if (ctx.status !== 'completed') return { error: 'locked', ctx };
  await run(`UPDATE doctor_patient_messages SET is_read = true, read_at = now()
              WHERE appointment_id = $1 AND sender_role = 'doctor' AND is_read = false`, [appointmentId]);
  return { ctx, messages: await listMessages(appointmentId), uid };
}

/** Patient sends a message; notifies the doctor in-app. */
async function sendPatientMessage(appointmentId, text) {
  const uid = await currentPatientId();
  if (!uid) return { ok: false, error: 'unauthenticated' };
  const ctx = await patientChatContext(uid, appointmentId);
  if (!ctx) return { ok: false, error: 'not_found' };
  if (ctx.status !== 'completed') return { ok: false, error: 'locked' };
  const body = String(text || '').trim().slice(0, 2000);
  if (!body) return { ok: false, error: 'empty' };
  const rows = await run(
    `INSERT INTO doctor_patient_messages (appointment_id, sender_id, sender_role, message)
     VALUES ($1,$2,'patient',$3) RETURNING id, sender_id, sender_role, message, is_read, created_at`,
    [appointmentId, uid, body]);
  if (ctx.doctor_user_id) {
    await run(`INSERT INTO notifications (user_id, type, title, body) VALUES ($1,'chat_message',$2,$3)`,
      [ctx.doctor_user_id, 'New message from a patient', `Re: ${ctx.booking_ref} — ${body.slice(0, 80)}`]);
  }
  return { ok: true, message: rows[0] };
}

export { getPatientChat, sendPatientMessage, listMessages };
