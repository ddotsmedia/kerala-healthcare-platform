// run-med-reminders.js — cron entry for medication reminders.
// Schedule every 5 minutes. Sends ~5 min before each reminder time.
// Usage: node run-med-reminders.js

import { closePool } from '@khp/db';
import { sendDueMedicationReminders } from './med-reminders.js';

sendDueMedicationReminders(6)
  .then((r) => console.log(`Medication reminders: sent ${r.sent}${r.due != null ? ` / ${r.due} due` : ''}.`))
  .then(closePool)
  .catch(async (err) => { console.error(`Med-reminder run failed: ${err.message}`); await closePool(); process.exit(1); });
