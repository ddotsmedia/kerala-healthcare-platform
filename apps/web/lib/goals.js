// goals.js — patient health goals. Current value auto-syncs from the health
// tracker (health_metrics); goals auto-mark achieved. User-scoped. Fails soft.

import { getPool } from '@khp/db';
import { GOAL_KEYS, goalByKey, isAchieved } from './goalConfig.js';

const COLS = `id, goal_type, title_ml, title_en, target_value, target_unit,
  current_value, start_value, start_date, target_date, status, notes, created_at`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`goals query failed: ${err.message}`); return []; }
}

async function latestMetric(userId, metricType) {
  if (!metricType) return null;
  const rows = await run(
    `SELECT value FROM health_metrics WHERE user_id = $1 AND metric_type = $2
      ORDER BY recorded_at DESC LIMIT 1`, [userId, metricType]);
  return rows[0] ? Number(rows[0].value) : null;
}

/** Goals with current value synced from the tracker + auto-achieve. */
async function listGoals(userId) {
  if (!userId) return [];
  const goals = await run(`SELECT ${COLS} FROM health_goals
                             WHERE user_id = $1 AND deleted_at IS NULL
                             ORDER BY (status = 'active') DESC, created_at DESC`, [userId]);
  for (const g of goals) {
    const cfg = goalByKey(g.goal_type);
    const metricVal = cfg ? await latestMetric(userId, cfg.metricType) : null;
    const current = metricVal != null ? metricVal : (g.current_value != null ? Number(g.current_value) : Number(g.start_value));
    let changed = false;
    if (current != null && Number(g.current_value) !== current) { g.current_value = current; changed = true; }
    if (g.status === 'active' && isAchieved(g)) { g.status = 'achieved'; changed = true; }
    if (changed) {
      await run(`UPDATE health_goals SET current_value = $2, status = $3, updated_at = now() WHERE id = $1`,
        [g.id, g.current_value, g.status]);
    }
  }
  return goals;
}

async function addGoal(userId, b) {
  if (!userId || !GOAL_KEYS.includes(b.goal_type)) return null;
  const cfg = goalByKey(b.goal_type);
  const start = b.start_value != null && b.start_value !== '' ? Number(b.start_value)
    : (cfg ? await latestMetric(userId, cfg.metricType) : null);
  const target = b.target_value != null && b.target_value !== '' ? Number(b.target_value) : null;
  const rows = await run(
    `INSERT INTO health_goals
       (user_id, goal_type, title_ml, title_en, target_value, target_unit, current_value, start_value, target_date, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING ${COLS}`,
    [userId, b.goal_type, b.title_ml || null, b.title_en || null, target,
     b.target_unit || (cfg ? cfg.unit : null), start, start, b.target_date || null,
     b.notes ? String(b.notes).slice(0, 500) : null]);
  return rows[0] || null;
}

async function updateGoal(userId, id, b) {
  if (!userId) return null;
  const sets = ['updated_at = now()'];
  const values = [];
  const push = (col, val) => { values.push(val); sets.push(`${col} = $${values.length}`); };
  if (b.current_value !== undefined && b.current_value !== '') push('current_value', Number(b.current_value));
  if (b.target_value !== undefined && b.target_value !== '') push('target_value', Number(b.target_value));
  if (b.target_date !== undefined) push('target_date', b.target_date || null);
  if (b.status && ['active', 'achieved', 'abandoned'].includes(b.status)) push('status', b.status);
  if (b.notes !== undefined) push('notes', b.notes ? String(b.notes).slice(0, 500) : null);
  if (sets.length === 1) return false;
  values.push(id); values.push(userId);
  const rows = await run(`UPDATE health_goals SET ${sets.join(', ')}
                            WHERE id = $${values.length - 1} AND user_id = $${values.length} AND deleted_at IS NULL
                          RETURNING ${COLS}`, values);
  return rows[0] || false;
}

async function deleteGoal(userId, id) {
  if (!userId) return null;
  const rows = await run(`UPDATE health_goals SET deleted_at = now(), updated_at = now()
                            WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id`, [id, userId]);
  return rows[0] || false;
}

export { listGoals, addGoal, updateGoal, deleteGoal };
