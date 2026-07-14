// chat.js — doctor side of the doctor↔patient chat. Only for the doctor's own
// COMPLETED appointment. Parameterised SQL.

import { getPool } from '@khp/db';
import { getSession } from './session.js';
import { currentDoctorId } from './profile.js';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`portal chat query failed: ${err.message}`); return []; }
}

async function doctorChatContext(doctorId, appointmentId) {
  const rows = await run(
    `SELECT a.id, a.status, a.booking_ref, a.patient_id, u.full_name AS patient_name
       FROM appointments a LEFT JOIN users u ON u.id = a.patient_id
      WHERE a.id = $1 AND a.provider_id = $2 AND a.deleted_at IS NULL`, [appointmentId, doctorId]);
  return rows[0] || null;
}

/** Thread for the doctor; marks patient messages read. */
async function getDoctorChat(appointmentId) {
  const doctorId = await currentDoctorId();
  if (!doctorId) return { error: 'unauthenticated' };
  const ctx = await doctorChatContext(doctorId, appointmentId);
  if (!ctx) return { error: 'not_found' };
  if (ctx.status !== 'completed') return { error: 'locked', ctx };
  await run(`UPDATE doctor_patient_messages SET is_read = true, read_at = now()
              WHERE appointment_id = $1 AND sender_role = 'patient' AND is_read = false`, [appointmentId]);
  const messages = await run(`SELECT id, sender_id, sender_role, message, created_at
                                FROM doctor_patient_messages WHERE appointment_id = $1 ORDER BY created_at ASC`, [appointmentId]);
  return { ctx, messages };
}

/** Doctor sends a message; notifies the patient in-app. */
async function sendDoctorMessage(appointmentId, text) {
  const s = await getSession();
  const doctorId = await currentDoctorId();
  if (!s || !doctorId) return { ok: false, error: 'unauthenticated' };
  const ctx = await doctorChatContext(doctorId, appointmentId);
  if (!ctx || ctx.status !== 'completed') return { ok: false, error: 'locked' };
  const body = String(text || '').trim().slice(0, 2000);
  if (!body) return { ok: false, error: 'empty' };
  await run(
    `INSERT INTO doctor_patient_messages (appointment_id, sender_id, sender_role, message)
     VALUES ($1,$2,'doctor',$3)`, [appointmentId, s.userId, body]);
  await run(`INSERT INTO notifications (user_id, type, title, body) VALUES ($1,'chat_message',$2,$3)`,
    [ctx.patient_id, 'New message from your doctor', `Re: ${ctx.booking_ref} — ${body.slice(0, 80)}`]);
  return { ok: true };
}

export { getDoctorChat, sendDoctorMessage };
