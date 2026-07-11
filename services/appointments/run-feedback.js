// run-feedback.js — cron entry for post-appointment feedback requests.
// Schedule every 30 minutes. Sends to completed appointments >2h past their slot.
// Usage: node run-feedback.js

import { closePool } from '@khp/db';
import { sendPendingFeedbackRequests } from './feedback.js';

sendPendingFeedbackRequests()
  .then((r) => console.log(`Feedback requests: sent ${r.sent}${r.due != null ? ` / ${r.due} due` : ''}.`))
  .then(closePool)
  .catch(async (err) => { console.error(`Feedback run failed: ${err.message}`); await closePool(); process.exit(1); });
