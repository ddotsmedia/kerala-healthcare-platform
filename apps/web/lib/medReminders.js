// medReminders.js — patient medication reminder schedules. User-scoped. Fails soft.

import { getPool } from '@khp/db';

const COLS = `id, medication_name, dosage, reminder_times, days_of_week,
  start_date, end_date, is_active, created_at`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`med-reminders query failed: ${err.message}`); return []; }
}

const cleanTimes = (t) => (Array.isArray(t) ? t : [])
  .map((x) => String(x).trim()).filter((x) => /^\d{1,2}:\d{2}$/.test(x)).slice(0, 12);
const cleanDays = (d) => (Array.isArray(d) ? d : []).map((x) => parseInt(x, 10)).filter((x) => x >= 0 && x <= 6);

async function listReminders(userId) {
  if (!userId) return [];
  return run(`SELECT ${COLS} FROM medication_reminders
                WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`, [userId]);
}

async function addReminder(userId, b) {
  if (!userId || !b.medication_name) return null;
  const times = cleanTimes(b.reminder_times);
  if (!times.length) return null;
  const days = cleanDays(b.days_of_week);
  const rows = await run(
    `INSERT INTO medication_reminders
       (user_id, medication_name, dosage, reminder_times, days_of_week, start_date, end_date, is_active)
     VALUES ($1,$2,$3,$4::time[],$5::int[],$6,$7,$8) RETURNING ${COLS}`,
    [userId, String(b.medication_name).slice(0, 200), b.dosage || null, times,
     days.length ? days : [0, 1, 2, 3, 4, 5, 6], b.start_date || null, b.end_date || null,
     b.is_active !== false]);
  return rows[0] || null;
}

async function updateReminder(userId, id, b) {
  if (!userId) return null;
  const sets = ['updated_at = now()'];
  const values = [];
  const push = (col, val, cast) => { values.push(val); sets.push(`${col} = $${values.length}${cast || ''}`); };
  if (b.medication_name) push('medication_name', String(b.medication_name).slice(0, 200));
  if (b.dosage !== undefined) push('dosage', b.dosage || null);
  if (b.reminder_times !== undefined) push('reminder_times', cleanTimes(b.reminder_times), '::time[]');
  if (b.days_of_week !== undefined) push('days_of_week', cleanDays(b.days_of_week), '::int[]');
  if (b.end_date !== undefined) push('end_date', b.end_date || null);
  if (typeof b.is_active === 'boolean') push('is_active', b.is_active);
  if (sets.length === 1) return false;
  values.push(id); values.push(userId);
  const rows = await run(`UPDATE medication_reminders SET ${sets.join(', ')}
                            WHERE id = $${values.length - 1} AND user_id = $${values.length} AND deleted_at IS NULL
                          RETURNING ${COLS}`, values);
  return rows[0] || false;
}

async function deleteReminder(userId, id) {
  if (!userId) return null;
  const rows = await run(`UPDATE medication_reminders SET deleted_at = now(), is_active = false, updated_at = now()
                            WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id`, [id, userId]);
  return rows[0] || false;
}

export { listReminders, addReminder, updateReminder, deleteReminder };
