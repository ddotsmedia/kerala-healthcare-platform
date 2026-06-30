// run-reminders.js — manual/cron entry for reminder jobs.
// Usage: node run-reminders.js 24h   (or 2h)
// In production these are scheduled (BullMQ/cron) — see BLOCKERS.md.

import { closePool } from '@khp/db';
import { sendReminders } from './notify.js';

const window = process.argv[2] === '2h' ? '2h' : '24h';

sendReminders(window)
  .then((r) => console.log(`Reminders (${window}): sent ${r.sent}${r.skipped ? ` (skipped: ${r.skipped})` : ''}.`))
  .then(closePool)
  .catch(async (err) => { console.error(`Reminder run failed: ${err.message}`); await closePool(); process.exit(1); });
