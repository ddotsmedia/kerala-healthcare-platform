// notify.js — orchestrate appointment notifications: render template, send via
// SMS + email, and log every attempt. Reminders respect quiet hours; immediate
// confirmation/cancellation/reschedule are transactional and always attempted
// (see BLOCKERS.md). Parameterised SQL only.

import { getPool } from '@khp/db';
import { sendSms } from './sms.js';
import { sendEmail } from './email.js';
import { logNotification } from './log.js';
import { isQuietHours } from './quiet-hours.js';
import { render as confirmed } from './templates/appointment-confirmed.js';
import { render as reminder } from './templates/appointment-reminder.js';
import { render as cancelled } from './templates/appointment-cancelled.js';
import { render as rescheduled } from './templates/appointment-rescheduled.js';

const TEMPLATES = {
  confirmed: { fn: confirmed, name: 'appointment-confirmed' },
  reminder: { fn: reminder, name: 'appointment-reminder' },
  cancelled: { fn: cancelled, name: 'appointment-cancelled' },
  rescheduled: { fn: rescheduled, name: 'appointment-rescheduled' }
};

function fmtDate(d) {
  if (!d) return '';
  return typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
}

async function fetchContext(appointmentId) {
  const { rows } = await getPool().query(
    `SELECT a.id, a.booking_ref, a.slot_date, a.slot_start, a.consultation_mode,
            a.consultation_room, d.display_name AS provider_name,
            u.full_name AS patient_name, u.locale
       FROM appointments a
       JOIN doctors d ON d.id = a.provider_id
       LEFT JOIN users u ON u.id = a.patient_id
      WHERE a.id = $1`,
    [appointmentId]
  );
  const a = rows[0];
  if (!a) return null;
  const room = a.consultation_room;
  return {
    appointmentId: a.id,
    booking_ref: a.booking_ref,
    slot_date: fmtDate(a.slot_date),
    slot_start: String(a.slot_start).slice(0, 5),
    provider_name: a.provider_name,
    consultation_mode: a.consultation_mode,
    consultation_room: room,
    roomUrl: room ? `${process.env.NEXT_PUBLIC_APP_URL || ''}/consult/${room}` : null,
    locale: a.locale || 'ml'
  };
}

/** Patient contact: encrypted columns are not decryptable here; use a dev override. */
function recipientFor() {
  return process.env.DEMO_NOTIFY_TO || null;
}

async function deliver(ctx, msg, templateName) {
  const to = recipientFor();
  const sms = await sendSms(to, msg.sms);
  await logNotification({ appointmentId: ctx.appointmentId, channel: 'sms', template: templateName, recipient: to, status: sms.status, error: sms.error });
  const email = await sendEmail(to, msg.subject, msg.body);
  await logNotification({ appointmentId: ctx.appointmentId, channel: 'email', template: templateName, recipient: to, status: email.status, error: email.error });
  return { sms, email };
}

/**
 * @param {'confirmed'|'reminder'|'cancelled'|'rescheduled'} event
 * @param {string} appointmentId
 * @param {object} [opts] { window:'24h'|'2h', byRole }
 */
async function notifyAppointmentEvent(event, appointmentId, opts = {}) {
  const tmpl = TEMPLATES[event];
  if (!tmpl) return { ok: false, error: 'unknown_event' };
  if (event === 'reminder' && isQuietHours()) {
    return { ok: false, error: 'quiet_hours' };
  }
  const ctx = await fetchContext(appointmentId);
  if (!ctx) return { ok: false, error: 'appointment_not_found' };
  const msg = tmpl.fn(ctx.locale, { ...ctx, window: opts.window });
  const res = await deliver(ctx, msg, tmpl.name);
  return { ok: true, ...res };
}

/**
 * Send 24h or 2h reminders for due confirmed appointments, mark the flag.
 * @param {'24h'|'2h'} window
 * @returns {Promise<{sent:number, skipped?:string}>}
 */
async function sendReminders(window) {
  if (isQuietHours()) return { sent: 0, skipped: 'quiet_hours' };
  const pool = getPool();
  const flag = window === '2h' ? 'reminder_2h_sent' : 'reminder_24h_sent';
  const due = window === '2h'
    ? `(slot_date + slot_start) BETWEEN now() AND now() + interval '2 hours'`
    : `slot_date = (current_date + 1)`;
  const { rows } = await pool.query(
    `SELECT id FROM appointments
      WHERE status = 'confirmed' AND ${flag} = false AND deleted_at IS NULL AND ${due}`
  );
  let sent = 0;
  for (const r of rows) {
    await notifyAppointmentEvent('reminder', r.id, { window });
    await pool.query(`UPDATE appointments SET ${flag} = true, updated_at = now() WHERE id = $1`, [r.id]);
    sent++;
  }
  return { sent };
}

export { notifyAppointmentEvent, sendReminders };
