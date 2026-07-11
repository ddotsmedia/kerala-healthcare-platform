// feedback.js — post-appointment feedback requests. 2h after the appointment,
// email the patient a star-rating link that leads to /feedback/[token].

import { randomBytes } from 'node:crypto';
import { getPool } from '@khp/db';
import { sendEmail, logNotification } from '@khp/notifications';
import { render as renderFeedback } from '@khp/notifications/templates/feedback-request.js';

const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || 'https://malayalidoctor.com';

function generateFeedbackToken() { return randomBytes(24).toString('hex'); }

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`feedback query failed: ${err.message}`); return null; }
}

/** Appointment context for a feedback token (public — token is the auth). */
async function getByFeedbackToken(token) {
  if (!token) return null;
  const rows = await run(
    `SELECT a.id, a.booking_ref, a.slot_date, a.slot_start, a.provider_id,
            a.patient_id, a.feedback_completed_at, d.display_name AS provider_name,
            d.slug AS provider_slug, u.locale
       FROM appointments a
       JOIN doctors d ON d.id = a.provider_id
       LEFT JOIN users u ON u.id = a.patient_id
      WHERE a.feedback_token = $1 AND a.deleted_at IS NULL`, [token]);
  return rows && rows[0] ? rows[0] : null;
}

/** Send one feedback request: generate token, email, mark feedback_sent_at. */
async function sendFeedbackRequest(appointmentId) {
  const rows = await run(
    `SELECT a.id, a.feedback_token, a.feedback_sent_at, a.status,
            d.display_name AS provider_name, u.locale
       FROM appointments a
       JOIN doctors d ON d.id = a.provider_id
       LEFT JOIN users u ON u.id = a.patient_id
      WHERE a.id = $1 AND a.deleted_at IS NULL`, [appointmentId]);
  const a = rows && rows[0];
  if (!a || a.status !== 'completed' || a.feedback_sent_at) return { ok: false, error: 'not_eligible' };

  const token = a.feedback_token || generateFeedbackToken();
  const locale = a.locale === 'en' ? 'en' : 'ml';
  const link = `${APP_URL()}/${locale}/feedback/${token}`;
  const msg = renderFeedback(locale, { provider_name: a.provider_name, link });

  const to = process.env.DEMO_NOTIFY_TO || null;
  const res = await sendEmail(to, msg.subject, msg.body);
  await logNotification({ appointmentId: a.id, channel: 'email', template: 'feedback-request', recipient: to, status: res.status, error: res.error });
  await run(`UPDATE appointments SET feedback_token = $2, feedback_sent_at = now(), updated_at = now() WHERE id = $1`, [a.id, token]);
  return { ok: true, status: res.status, token };
}

/** Cron: completed appointments 2h past their slot, no feedback sent yet. */
async function sendPendingFeedbackRequests() {
  const due = await run(
    `SELECT id FROM appointments
      WHERE status = 'completed' AND feedback_sent_at IS NULL AND deleted_at IS NULL
        AND (slot_date + slot_start) < now() - interval '2 hours'`);
  if (!due) return { sent: 0 };
  let sent = 0;
  for (const r of due) { const res = await sendFeedbackRequest(r.id); if (res.ok) sent++; }
  return { sent, due: due.length };
}

/** Mark a token's feedback as completed (called after the review is created). */
async function markFeedbackCompleted(token) {
  await run(`UPDATE appointments SET feedback_completed_at = now(), updated_at = now()
              WHERE feedback_token = $1 AND feedback_completed_at IS NULL`, [token]);
}

export { generateFeedbackToken, getByFeedbackToken, sendFeedbackRequest, sendPendingFeedbackRequests, markFeedbackCompleted };
