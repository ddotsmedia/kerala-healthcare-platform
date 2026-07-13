// med-reminders.js — send medication reminders ~5 min before each scheduled time.
// A send ledger (medication_reminder_sends) makes repeated cron runs idempotent.
// Times are evaluated in Asia/Kolkata.

import { getPool } from '@khp/db';
import { sendEmail } from './email.js';
import { logNotification } from './log.js';
import { render as renderMed } from './templates/med-reminder.js';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`med-reminders query failed: ${err.message}`); return null; }
}

/**
 * Find reminders whose next time falls within the next `windowMin` minutes,
 * claim each via the ledger, then email + in-app notify. Cron: every ~5 min.
 */
async function sendDueMedicationReminders(windowMin = 6) {
  const due = await run(
    `SELECT mr.id, mr.user_id, mr.medication_name, mr.dosage, t AS rtime,
            (now() AT TIME ZONE 'Asia/Kolkata')::date AS ist_date,
            u.locale
       FROM medication_reminders mr
       CROSS JOIN LATERAL unnest(mr.reminder_times) AS t
       LEFT JOIN users u ON u.id = mr.user_id
      WHERE mr.deleted_at IS NULL AND mr.is_active = true
        AND (mr.start_date IS NULL OR mr.start_date <= (now() AT TIME ZONE 'Asia/Kolkata')::date)
        AND (mr.end_date   IS NULL OR mr.end_date   >= (now() AT TIME ZONE 'Asia/Kolkata')::date)
        AND (extract(dow FROM (now() AT TIME ZONE 'Asia/Kolkata'))::int = ANY(mr.days_of_week))
        AND t >  (now() AT TIME ZONE 'Asia/Kolkata')::time
        AND t <= ((now() AT TIME ZONE 'Asia/Kolkata')::time + ($1 || ' minutes')::interval)`,
    [String(windowMin)]);
  if (!due) return { sent: 0 };

  let sent = 0;
  for (const r of due) {
    // Claim this (reminder, date, time); skip if another run already did.
    const claim = await run(
      `INSERT INTO medication_reminder_sends (reminder_id, sent_date, sent_time)
       VALUES ($1,$2,$3) ON CONFLICT (reminder_id, sent_date, sent_time) DO NOTHING RETURNING id`,
      [r.id, r.ist_date, r.rtime]);
    if (!claim || claim.length === 0) continue;

    const locale = r.locale === 'en' ? 'en' : 'ml';
    const msg = renderMed(locale, { medication_name: r.medication_name, dosage: r.dosage, time: String(r.rtime).slice(0, 5) });
    const to = process.env.DEMO_NOTIFY_TO || null;
    const res = await sendEmail(to, msg.subject, msg.body);
    await logNotification({ appointmentId: null, channel: 'email', template: 'med-reminder', recipient: to, status: res.status, error: res.error });
    await run(`INSERT INTO notifications (user_id, type, title, body) VALUES ($1,'medication_reminder',$2,$3)`,
      [r.user_id, msg.subject, `${r.medication_name}${r.dosage ? ` · ${r.dosage}` : ''} — ${String(r.rtime).slice(0, 5)}`]);
    sent++;
  }
  return { sent, due: due.length };
}

export { sendDueMedicationReminders };
