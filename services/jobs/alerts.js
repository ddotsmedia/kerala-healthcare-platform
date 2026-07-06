// alerts.js — job-alert engine: match new jobs to saved alerts, send emails,
// run daily/weekly digests. Parameterised SQL only; fails soft.
//
// Recipient note: users.email_enc is column-encrypted and not decryptable here
// (same constraint as services/notifications/notify.js), so the recipient uses
// the DEMO_NOTIFY_TO override in non-prod. Wire real decryption when the KMS
// helper is available. See BLOCKERS.md.

import { createHmac } from 'node:crypto';
import { getPool } from '@khp/db';
import { sendEmail, logNotification } from '@khp/notifications';
import { render as renderJobAlert } from '@khp/notifications/templates/job-alert.js';

const MAX_EMAILS_PER_DAY = 5;
const DIGEST_JOB_LIMIT = 5;
const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL || 'https://malayalidoctor.com';

function unsubSecret() {
  return process.env.JWT_SECRET || process.env.AUTH_PEPPER || 'dev-pepper';
}

/** Stateless unsubscribe token — no DB token storage needed for email links. */
function unsubscribeToken(alertId) {
  return createHmac('sha256', unsubSecret()).update(String(alertId)).digest('hex').slice(0, 32);
}

function verifyUnsubscribe(alertId, token) {
  return typeof token === 'string' && token.length === 32 && token === unsubscribeToken(alertId);
}

function unsubscribeUrl(alertId, locale) {
  const t = unsubscribeToken(alertId);
  return `${APP_URL()}/${locale}/jobs/alerts/unsubscribe?id=${alertId}&token=${t}`;
}

/**
 * Does a job satisfy an alert's saved filters? Mirrors buildJobQuery semantics.
 * @param {object} filters saved JSONB { specialty_id, district_id, job_type, role_category, salary_min, is_remote, is_urgent, term }
 * @param {object} job job_listings row
 */
function filterMatchesJob(filters, job) {
  if (!filters || !job) return false;
  const f = filters;
  if (f.specialty_id && f.specialty_id !== job.specialty_id) return false;
  if (f.district_id && f.district_id !== job.district_id) return false;
  if (f.job_type && f.job_type !== job.job_type && f.job_type !== job.employment_type) return false;
  if (f.role_category && String(f.role_category).toLowerCase() !== String(job.role_category || '').toLowerCase()) return false;
  const wantMin = parseInt(f.salary_min, 10);
  if (Number.isFinite(wantMin) && job.salary_max != null && job.salary_max < wantMin) return false;
  if ((f.is_remote === true || f.is_remote === 'true') && job.is_remote !== true) return false;
  if ((f.is_urgent === true || f.is_urgent === 'true') && job.is_urgent !== true) return false;
  if (f.term) {
    const hay = `${job.title || ''} ${job.description || ''} ${job.role_category || ''}`.toLowerCase();
    if (!hay.includes(String(f.term).toLowerCase())) return false;
  }
  return true;
}

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`job-alerts query failed: ${err.message}`); return []; }
}

/** Emails sent for an alert in the trailing 24h (rate-limit ledger). */
async function emailsSentToday(alertId) {
  const r = await run(
    `SELECT count(*)::int AS n FROM job_alert_sends
      WHERE alert_id = $1 AND channel = 'email' AND status = 'sent'
        AND created_at >= now() - interval '24 hours'`, [alertId]);
  return r[0] ? r[0].n : 0;
}

async function jobsAlreadySent(alertId, jobIds) {
  if (!jobIds.length) return new Set();
  const r = await run(
    `SELECT DISTINCT job_id FROM job_alert_sends WHERE alert_id = $1 AND job_id = ANY($2::uuid[])`,
    [alertId, jobIds]);
  return new Set(r.map((x) => x.job_id));
}

async function recordSend(alertId, jobIds, status) {
  const ids = jobIds.length ? jobIds : [null];
  for (const jid of ids) {
    await run(
      `INSERT INTO job_alert_sends (alert_id, job_id, channel, status) VALUES ($1, $2, 'email', $3)`,
      [alertId, jid, status]);
  }
}

/** Recipient email for a user. Encrypted column not decryptable → dev override. */
function recipientFor() {
  return process.env.DEMO_NOTIFY_TO || null;
}

async function userLocale(userId) {
  const r = await run(`SELECT locale FROM users WHERE id = $1`, [userId]);
  return (r[0] && r[0].locale) || 'ml';
}

/**
 * Render + send one job-alert email for a set of matching jobs.
 * Enforces the max-5-emails-per-alert-per-day rate limit.
 * @returns {Promise<{status:string, count:number}>}
 */
async function sendJobAlertEmail(userId, alert, jobs) {
  const list = (jobs || []).slice(0, DIGEST_JOB_LIMIT);
  if (!list.length) return { status: 'skipped_empty', count: 0 };
  if (await emailsSentToday(alert.id) >= MAX_EMAILS_PER_DAY) {
    await recordSend(alert.id, list.map((j) => j.id), 'rate_limited');
    return { status: 'rate_limited', count: 0 };
  }
  const locale = await userLocale(userId);
  const to = recipientFor();
  const msg = renderJobAlert(locale, {
    alertName: alert.name,
    jobs: list,
    total: (jobs || []).length,
    unsubscribeUrl: unsubscribeUrl(alert.id, locale),
    appUrl: APP_URL(), locale
  });
  const res = await sendEmail(to, msg.subject, msg.body);
  await logNotification({ appointmentId: null, channel: 'email', template: 'job-alert', recipient: to, status: res.status, error: res.error });
  await recordSend(alert.id, list.map((j) => j.id), res.status === 'failed' ? 'failed' : 'sent');
  await run(`UPDATE job_alerts SET last_sent_at = now(), updated_at = now() WHERE id = $1`, [alert.id]);
  return { status: res.status, count: list.length };
}

/**
 * New job posted → notify all active 'instant' alerts whose filters match.
 * @param {object} job job_listings row (must include filterable columns)
 * @returns {Promise<{matched:number, sent:number}>}
 */
async function matchJobToAlerts(job) {
  if (!job || !job.id) return { matched: 0, sent: 0 };
  const alerts = await run(
    `SELECT id, user_id, name, filters FROM job_alerts
      WHERE is_active = true AND deleted_at IS NULL AND frequency = 'instant'`, []);
  let matched = 0, sent = 0;
  for (const a of alerts) {
    if (!filterMatchesJob(a.filters, job)) continue;
    matched++;
    const already = await jobsAlreadySent(a.id, [job.id]);
    if (already.has(job.id)) continue;
    const r = await sendJobAlertEmail(a.user_id, a, [job]);
    if (r.status === 'sent' || r.status === 'simulated') sent++;
  }
  return { matched, sent };
}

/**
 * Digest run for non-instant alerts. Collects matches posted since the alert's
 * last send (bounded by frequency window), skips already-sent jobs, emails once.
 * @param {'daily'|'weekly'} frequency
 * @returns {Promise<{alerts:number, sent:number}>}
 */
async function dailyDigest(frequency = 'daily') {
  const windowSql = frequency === 'weekly' ? "interval '7 days'" : "interval '1 day'";
  const alerts = await run(
    `SELECT id, user_id, name, filters, last_sent_at FROM job_alerts
      WHERE is_active = true AND deleted_at IS NULL AND frequency = $1`, [frequency]);
  let sent = 0;
  for (const a of alerts) {
    const jobs = await run(
      `SELECT j.id, j.slug, j.title, j.role_category, j.specialty_id, j.district_id,
              j.job_type, j.employment_type, j.description, j.salary_min, j.salary_max,
              j.salary_period, j.is_remote, j.is_urgent, j.created_at,
              e.org_name, di.name_ml AS district_ml, di.name_en AS district_en
         FROM job_listings j
         JOIN employer_profiles e ON e.id = j.employer_id
         LEFT JOIN districts di ON di.id = j.district_id
        WHERE j.status = 'active' AND j.deleted_at IS NULL
          AND j.created_at >= COALESCE($1, now() - ${windowSql})
        ORDER BY j.created_at DESC LIMIT 200`,
      [a.last_sent_at]);
    const matches = jobs.filter((j) => filterMatchesJob(a.filters, j));
    if (!matches.length) continue;
    const already = await jobsAlreadySent(a.id, matches.map((j) => j.id));
    const fresh = matches.filter((j) => !already.has(j.id));
    if (!fresh.length) continue;
    const r = await sendJobAlertEmail(a.user_id, a, fresh);
    if (r.status === 'sent' || r.status === 'simulated') sent++;
  }
  return { alerts: alerts.length, sent };
}

export {
  filterMatchesJob, matchJobToAlerts, sendJobAlertEmail,
  dailyDigest, unsubscribeToken, verifyUnsubscribe, unsubscribeUrl
};
