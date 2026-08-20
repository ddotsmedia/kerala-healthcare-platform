// doctorAnalytics.js — read-only performance data for the logged-in doctor's
// own dashboard. Parameterised SQL only. provider_id === doctors.id.

import { getPool } from '@khp/db';

async function rows(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`doctorAnalytics query failed: ${err.message}`); return []; }
}

const MODE_LABELS = { in_person: 'In-person', video: 'Video', phone: 'Phone' };

/**
 * Aggregate profile performance over the last `days` days.
 * @param {string} providerId doctors.id
 * @param {number} [days=30]
 */
export async function getProfileStats(providerId, days = 30) {
  if (!providerId) return null;
  const d = Math.max(1, Math.min(365, parseInt(days, 10) || 30));

  const [totals] = await rows(
    `SELECT
       (SELECT count(*) FROM provider_profile_views
          WHERE provider_id=$1 AND viewed_at >= now() - make_interval(days => $2))::int AS profile_views,
       (SELECT count(DISTINCT coalesce(viewer_user_id::text, host(viewer_ip))) FROM provider_profile_views
          WHERE provider_id=$1 AND viewed_at >= now() - make_interval(days => $2))::int AS unique_visitors,
       (SELECT count(*) FROM appointments
          WHERE provider_id=$1 AND deleted_at IS NULL
            AND slot_date >= current_date - $2)::int AS appointment_count,
       (SELECT round(avg(rating)::numeric, 1) FROM reviews
          WHERE entity_type='doctor' AND entity_id=$1 AND status='approved' AND deleted_at IS NULL) AS review_avg,
       (SELECT count(*) FROM reviews
          WHERE entity_type='doctor' AND entity_id=$1 AND status='approved' AND deleted_at IS NULL)::int AS review_count`,
    [providerId, d]
  );

  const viewsByDay = await rows(
    `SELECT to_char(g.day, 'YYYY-MM-DD') AS day, coalesce(v.n, 0)::int AS n
       FROM generate_series(current_date - ($2 - 1), current_date, interval '1 day') AS g(day)
       LEFT JOIN (
         SELECT date_trunc('day', viewed_at)::date AS day, count(*) AS n
           FROM provider_profile_views
          WHERE provider_id=$1 AND viewed_at >= now() - make_interval(days => $2)
          GROUP BY 1
       ) v ON v.day = g.day
      ORDER BY g.day`,
    [providerId, d]
  );

  const byModeRaw = await rows(
    `SELECT consultation_mode AS mode, count(*)::int AS n
       FROM appointments
      WHERE provider_id=$1 AND deleted_at IS NULL AND slot_date >= current_date - $2
      GROUP BY 1 ORDER BY 2 DESC`,
    [providerId, d]
  );
  const byMode = byModeRaw.map((r) => ({ ...r, label: MODE_LABELS[r.mode] || r.mode }));

  const recentReviews = await rows(
    `SELECT id, rating, title, body, created_at
       FROM reviews
      WHERE entity_type='doctor' AND entity_id=$1 AND status='approved' AND deleted_at IS NULL
      ORDER BY created_at DESC LIMIT 5`,
    [providerId]
  );

  return {
    days: d,
    profile_views: totals ? totals.profile_views : 0,
    unique_visitors: totals ? totals.unique_visitors : 0,
    appointment_count: totals ? totals.appointment_count : 0,
    appointment_trend: viewsByDay, // day series for chart
    review_avg: totals && totals.review_avg != null ? Number(totals.review_avg) : null,
    review_count: totals ? totals.review_count : 0,
    search_appearances: null, // search-impression tracking not yet available
    byMode,
    recentReviews
  };
}

/** Static, profile-completeness-based tips. @param {object} doctor doctors row */
export function completenessTips(doctor) {
  const tips = [];
  if (!doctor) return tips;
  if (!doctor.photo_url) tips.push('Add a profile photo — profiles with photos get up to 3x more views.');
  if (!doctor.about_en && !doctor.about_ml) tips.push('Write an "About" section so patients know your approach.');
  if (doctor.consultation_fee == null) tips.push('Set your consultation fee to appear in fee-filtered searches.');
  if (!doctor.years_experience) tips.push('Add your years of experience to build patient trust.');
  return tips;
}
