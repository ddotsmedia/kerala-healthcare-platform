// @khp/jobs — job-alert matching, digests, and email delivery.

export {
  filterMatchesJob, matchJobToAlerts, sendJobAlertEmail,
  dailyDigest, unsubscribeToken, verifyUnsubscribe
} from './alerts.js';
