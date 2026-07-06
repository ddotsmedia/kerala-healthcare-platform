// run-digest.js — manual/cron entry for job-alert digests.
// Usage: node run-digest.js daily   (or weekly). Schedule daily at 08:00 via
// cron/BullMQ. Instant alerts fire inline on job post (see alerts.js).

import { closePool } from '@khp/db';
import { dailyDigest } from './alerts.js';

const frequency = process.argv[2] === 'weekly' ? 'weekly' : 'daily';

dailyDigest(frequency)
  .then((r) => console.log(`Job-alert digest (${frequency}): ${r.sent}/${r.alerts} alert(s) emailed.`))
  .then(closePool)
  .catch(async (err) => { console.error(`Digest run failed: ${err.message}`); await closePool(); process.exit(1); });
