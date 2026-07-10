// labTrends.js — per-parameter history across a patient's lab reports.
// (Spec path services/patient/lab-trends.js — kept in apps/web/lib for the web
// import convention; see BLOCKERS.)

import { getPool } from '@khp/db';
import { MARKER_KEYS, bandFor } from './labMarkers.js';

/**
 * All recorded values for one parameter, oldest→newest, with trend direction.
 * @returns {{ parameter:string, points:Array<{date,value,out}>, trend:string, band:object }}
 */
async function getParameterHistory(userId, parameter) {
  if (!userId || !MARKER_KEYS.includes(parameter)) return { parameter, points: [], trend: 'none', band: {} };
  let rows = [];
  try {
    rows = (await getPool().query(
      `SELECT report_date, results -> $2 AS r
         FROM lab_reports
        WHERE user_id = $1 AND deleted_at IS NULL AND results ? $2
        ORDER BY report_date ASC`, [userId, parameter])).rows;
  } catch (err) { console.error(`lab-trends query failed: ${err.message}`); }

  const points = rows.map((row) => {
    const r = row.r || {};
    const value = Number(r.value);
    const band = bandFor(parameter, r);
    const out = value != null && ((band.min != null && value < band.min) || (band.max != null && value > band.max));
    return { date: String(row.report_date).slice(0, 10), value, out, normal_min: band.min, normal_max: band.max };
  }).filter((p) => Number.isFinite(p.value));

  let trend = 'none';
  if (points.length >= 2) {
    const first = points[0].value, last = points[points.length - 1].value;
    trend = last > first ? 'up' : last < first ? 'down' : 'stable';
  }
  const band = points.length ? { min: points[0].normal_min, max: points[0].normal_max } : bandFor(parameter, null);
  return { parameter, points, trend, band };
}

export { getParameterHistory };
