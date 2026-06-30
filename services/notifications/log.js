// log.js — write notification attempts to notification_log. Recipient is masked.

import { getPool } from '@khp/db';

function mask(recipient) {
  if (!recipient) return null;
  const s = String(recipient);
  return s.length <= 4 ? '****' : `****${s.slice(-4)}`;
}

/** @param {object} e { appointmentId, channel, template, recipient, status, error } */
async function logNotification(e) {
  try {
    const sentAt = e.status === 'sent' ? new Date() : null;
    await getPool().query(
      `INSERT INTO notification_log
         (appointment_id, channel, template, recipient, status, error_message, sent_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [e.appointmentId, e.channel, e.template || null, mask(e.recipient), e.status, e.error || null, sentAt]
    );
  } catch (err) {
    console.error(`logNotification failed: ${err.message}`);
  }
}

export { logNotification, mask };
