// analytics.js — platform KPIs via plain SQL aggregates, cached 5 min.

import { getPool } from '@khp/db';
import { cached } from '@khp/cache';

async function computeMetrics() {
  const { rows } = await getPool().query(`
    SELECT
      (SELECT count(*) FROM users WHERE deleted_at IS NULL) AS users_total,
      (SELECT count(*) FROM users WHERE created_at::date = current_date) AS users_today,
      (SELECT count(*) FROM users WHERE created_at > now() - interval '7 days') AS users_week,
      (SELECT count(*) FROM appointments WHERE status='confirmed') AS appts_confirmed,
      (SELECT count(*) FROM appointments WHERE slot_date = current_date) AS appts_today,
      (SELECT count(*) FROM appointments WHERE status='cancelled') AS appts_cancelled,
      (SELECT count(*) FROM appointments) AS appts_total,
      (SELECT count(*) FROM doctors WHERE verification_status='verified' AND deleted_at IS NULL) AS providers_verified,
      (SELECT count(*) FROM doctors WHERE verification_status='pending' AND deleted_at IS NULL) AS providers_pending,
      (SELECT count(*) FROM content_items WHERE status='published' AND deleted_at IS NULL) AS content_published,
      (SELECT count(*) FROM content_items WHERE status='in_review' AND deleted_at IS NULL) AS content_review,
      (SELECT count(*) FROM job_listings WHERE status='active' AND deleted_at IS NULL) AS jobs_active,
      (SELECT count(*) FROM job_applications WHERE created_at > now() - interval '7 days') AS applications_week,
      (SELECT count(*) FROM ai_interaction_log WHERE created_at::date = current_date) AS ai_today
  `);
  const m = rows[0];
  m.cancellation_rate = Number(m.appts_total) > 0
    ? Math.round((Number(m.appts_cancelled) / Number(m.appts_total)) * 100) : 0;
  return m;
}

function getMetrics() {
  return cached('analytics:metrics', 300, computeMetrics);
}

export { getMetrics };
