// platformAnalytics.js — P-G1 growth analytics from page_views + conversion_events.
// Read-only aggregates, cached 5 min. Privacy-preserving (session-level only).

import { getPool } from '@khp/db';
import { cached } from '@khp/cache';

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}
const clampDays = (d, def) => Math.max(1, Math.min(365, parseInt(d, 10) || def));

/** Today / this week / this month headline numbers. */
export function getOverview() {
  return cached('pa:overview', 300, async () => {
    const [r] = await rows(`
      SELECT
        (SELECT count(DISTINCT session_id) FROM page_views WHERE viewed_at::date = current_date) AS active_today,
        (SELECT count(DISTINCT session_id) FROM page_views WHERE viewed_at > now() - interval '7 days') AS active_week,
        (SELECT count(DISTINCT session_id) FROM page_views WHERE viewed_at > now() - interval '30 days') AS active_month,
        (SELECT count(*) FROM page_views WHERE viewed_at::date = current_date) AS views_today,
        (SELECT count(*) FROM page_views WHERE viewed_at > now() - interval '7 days') AS views_week,
        (SELECT count(*) FROM page_views WHERE viewed_at > now() - interval '30 days') AS views_month,
        (SELECT count(*) FROM users WHERE created_at::date = current_date) AS reg_today,
        (SELECT count(*) FROM users WHERE created_at > now() - interval '7 days') AS reg_week,
        (SELECT count(*) FROM users WHERE created_at > now() - interval '30 days') AS reg_month,
        (SELECT count(*) FROM conversion_events WHERE event_type='booking_completed' AND created_at::date = current_date) AS book_today,
        (SELECT count(*) FROM conversion_events WHERE event_type='booking_completed' AND created_at > now() - interval '7 days') AS book_week,
        (SELECT count(*) FROM conversion_events WHERE event_type='booking_completed' AND created_at > now() - interval '30 days') AS book_month
    `);
    const n = (v) => Number(v || 0);
    return {
      activeUsers: { today: n(r.active_today), week: n(r.active_week), month: n(r.active_month) },
      pageViews: { today: n(r.views_today), week: n(r.views_week), month: n(r.views_month) },
      registrations: { today: n(r.reg_today), week: n(r.reg_week), month: n(r.reg_month) },
      bookings: { today: n(r.book_today), week: n(r.book_week), month: n(r.book_month) }
    };
  });
}

export function getTopPages(days = 30, limit = 20) {
  const d = clampDays(days, 30);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  return cached(`pa:pages:${d}:${l}`, 300, async () => rows(
    `SELECT path, count(*)::int AS views, count(DISTINCT session_id)::int AS visitors
       FROM page_views WHERE viewed_at > now() - make_interval(days => $1)
      GROUP BY path ORDER BY views DESC LIMIT $2`, [d, l]));
}

export function getConversionFunnel(days = 30) {
  const d = clampDays(days, 30);
  return cached(`pa:funnel:${d}`, 300, async () => {
    const r = await rows(
      `SELECT event_type, count(*)::int AS n FROM conversion_events
        WHERE created_at > now() - make_interval(days => $1)
          AND event_type IN ('search','profile_view','booking_started','booking_completed')
        GROUP BY event_type`, [d]);
    const by = Object.fromEntries(r.map((x) => [x.event_type, x.n]));
    const steps = [
      { key: 'search', label: 'Search', n: by.search || 0 },
      { key: 'profile_view', label: 'Profile view', n: by.profile_view || 0 },
      { key: 'booking_started', label: 'Booking started', n: by.booking_started || 0 },
      { key: 'booking_completed', label: 'Booking completed', n: by.booking_completed || 0 }
    ];
    const top = steps[0].n || 1;
    return steps.map((s) => ({ ...s, pct: Math.round((s.n / top) * 100) }));
  });
}

export function getTopSearchQueries(days = 7, limit = 15) {
  const d = clampDays(days, 7);
  return cached(`pa:queries:${d}`, 300, async () => rows(
    `SELECT metadata->>'q' AS query, count(*)::int AS n
       FROM conversion_events
      WHERE event_type='search' AND created_at > now() - make_interval(days => $1)
        AND coalesce(metadata->>'q','') <> ''
      GROUP BY 1 ORDER BY n DESC LIMIT $2`, [d, limit]));
}

export function getRegistrationTrend(days = 30) {
  const d = clampDays(days, 30);
  return cached(`pa:reg:${d}`, 300, async () => rows(
    `SELECT to_char(g.day,'YYYY-MM-DD') AS day, coalesce(c.n,0)::int AS n
       FROM generate_series(current_date - ($1 - 1), current_date, interval '1 day') g(day)
       LEFT JOIN (SELECT created_at::date AS day, count(*) n FROM users
                   WHERE created_at > now() - make_interval(days => $1) GROUP BY 1) c ON c.day = g.day
      ORDER BY g.day`, [d]));
}

export function getTrafficSources(days = 30) {
  const d = clampDays(days, 30);
  return cached(`pa:sources:${d}`, 300, async () => {
    const r = await rows(
      `SELECT
         CASE
           WHEN referrer IS NULL OR referrer='' THEN 'direct'
           WHEN referrer ~* 'google|bing|yahoo|duckduckgo' OR utm_medium='organic' THEN 'organic'
           WHEN referrer ~* 'facebook|instagram|twitter|t\\.co|whatsapp|linkedin|youtube|wa\\.me' THEN 'social'
           ELSE 'referral'
         END AS source, count(*)::int AS n
       FROM page_views WHERE viewed_at > now() - make_interval(days => $1)
       GROUP BY 1`, [d]);
    const by = Object.fromEntries(r.map((x) => [x.source, x.n]));
    return ['direct', 'organic', 'social', 'referral'].map((s) => ({ source: s, n: by[s] || 0 }));
  });
}
