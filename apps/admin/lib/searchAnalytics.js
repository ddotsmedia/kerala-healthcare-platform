// searchAnalytics.js — P-G2 search-log aggregates for the admin. Cached 5 min.

import { getPool } from '@khp/db';
import { cached } from '@khp/cache';

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}
const clampDays = (d, def) => Math.max(1, Math.min(365, parseInt(d, 10) || def));

export function getTopQueries(days = 7, limit = 20) {
  const d = clampDays(days, 7);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  return cached(`sa:top:${d}:${l}`, 300, async () => rows(
    `SELECT lower(query) AS query, count(*)::int AS searches,
            round(avg(result_count),1) AS avg_results
       FROM search_logs WHERE searched_at > now() - make_interval(days => $1)
      GROUP BY lower(query) ORDER BY searches DESC LIMIT $2`, [d, l]));
}

export function getZeroResultQueries(days = 7, limit = 30) {
  const d = clampDays(days, 7);
  return cached(`sa:zero:${d}`, 300, async () => rows(
    `SELECT lower(query) AS query, count(*)::int AS searches, max(searched_at) AS last_seen
       FROM search_logs
      WHERE searched_at > now() - make_interval(days => $1) AND result_count = 0
      GROUP BY lower(query) ORDER BY searches DESC LIMIT $2`, [d, limit]));
}

export function getFilterUsage(days = 30) {
  const d = clampDays(days, 30);
  return cached(`sa:filters:${d}`, 300, async () => {
    const [r] = await rows(
      `SELECT
         count(*) FILTER (WHERE filters ? 'specialty_id')::int AS specialty,
         count(*) FILTER (WHERE filters ? 'district_id')::int AS district,
         count(*) FILTER (WHERE filters ? 'mode')::int AS mode,
         count(*) FILTER (WHERE filters ? 'language')::int AS language,
         count(*) FILTER (WHERE filters IS NOT NULL)::int AS any_filter,
         count(*)::int AS total
       FROM search_logs WHERE searched_at > now() - make_interval(days => $1)`, [d]);
    return r || { specialty: 0, district: 0, mode: 0, language: 0, any_filter: 0, total: 0 };
  });
}

export function getQueryToClickRate(days = 30) {
  const d = clampDays(days, 30);
  return cached(`sa:ctr:${d}`, 300, async () => {
    const [r] = await rows(
      `SELECT count(*)::int AS total, count(*) FILTER (WHERE clicked_result_id IS NOT NULL)::int AS clicked
         FROM search_logs WHERE searched_at > now() - make_interval(days => $1)`, [d]);
    const total = r ? r.total : 0;
    const clicked = r ? r.clicked : 0;
    return { total, clicked, rate: total > 0 ? Math.round((clicked / total) * 100) : 0 };
  });
}
