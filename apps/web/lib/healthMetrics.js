// healthMetrics.js — patient health-tracker data access. Strictly user-scoped.
// Parameterised SQL; fails soft.

import { getPool } from '@khp/db';
import { METRIC_TYPES, UNIT } from './metricConfig.js';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`health-metrics query failed: ${err.message}`); return []; }
}

/** Insert a reading. Validates metric_type + numeric value. */
async function addMetric(userId, b) {
  if (!userId || !METRIC_TYPES.includes(b.metric_type)) return null;
  const value = Number(b.value);
  if (!Number.isFinite(value)) return null;
  const rows = await run(
    `INSERT INTO health_metrics (user_id, metric_type, value, unit, notes, recorded_at)
     VALUES ($1,$2,$3,$4,$5,COALESCE($6::timestamptz, now()))
     RETURNING id, metric_type, value, unit, notes, recorded_at`,
    [userId, b.metric_type, value, b.unit || UNIT[b.metric_type] || null,
     b.notes ? String(b.notes).slice(0, 500) : null, b.recorded_at || null]);
  return rows[0] || null;
}

/** Readings of one type within the last `days`, oldest→newest. */
async function listMetrics(userId, type, days = 30) {
  if (!userId || !METRIC_TYPES.includes(type)) return [];
  const d = Math.min(365, Math.max(1, parseInt(days, 10) || 30));
  return run(
    `SELECT id, value, unit, notes, recorded_at
       FROM health_metrics
      WHERE user_id = $1 AND metric_type = $2
        AND recorded_at >= now() - ($3 || ' days')::interval
      ORDER BY recorded_at ASC`, [userId, type, String(d)]);
}

/** latest / trend / min / max / avg for a readings array (oldest→newest). */
function statsFor(readings) {
  if (!readings.length) return { latest: null, trend: 'none', min: null, max: null, avg: null, count: 0 };
  const vals = readings.map((r) => Number(r.value));
  const latest = vals[vals.length - 1];
  const prev = vals.length > 1 ? vals[vals.length - 2] : latest;
  const trend = latest > prev ? 'up' : latest < prev ? 'down' : 'stable';
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const avg = Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  return { latest, latestAt: readings[readings.length - 1].recorded_at, trend, min, max, avg, count: vals.length };
}

/** All tracked types with readings + stats for the dashboard. */
async function getTrackerData(userId, days = 30) {
  const out = {};
  for (const type of METRIC_TYPES) {
    const readings = await listMetrics(userId, type, days);
    out[type] = { readings, stats: statsFor(readings) };
  }
  return out;
}

export { addMetric, listMetrics, statsFor, getTrackerData };
