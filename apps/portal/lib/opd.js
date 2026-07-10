// opd.js — doctor self-service OPD schedule management. provider = logged-in
// doctor. A doctor may only manage OPD at hospitals they are affiliated with.

import { getPool } from '@khp/db';

/** Hospitals the doctor is affiliated with (for the OPD form select). */
async function myAffiliatedHospitals(providerId) {
  if (!providerId) return [];
  const { rows } = await getPool().query(
    `SELECT h.id, h.name_ml, h.name_en
       FROM hospital_providers hp
       JOIN hospitals h ON h.id = hp.hospital_id AND h.deleted_at IS NULL
      WHERE hp.doctor_id = $1 AND hp.deleted_at IS NULL
      ORDER BY h.name_en`, [providerId]);
  return rows;
}

/** The doctor's own OPD schedules, with hospital names. */
async function myOpd(providerId) {
  if (!providerId) return [];
  const { rows } = await getPool().query(
    `SELECT o.id, o.hospital_id, o.day_of_week, o.start_time, o.end_time, o.consultation_type,
            o.max_tokens, o.notes_en, o.is_active,
            h.name_ml AS hospital_name_ml, h.name_en AS hospital_name_en
       FROM opd_schedules o
       JOIN hospitals h ON h.id = o.hospital_id
      WHERE o.provider_id = $1
      ORDER BY h.name_en, o.start_time`, [providerId]);
  return rows;
}

async function isAffiliated(providerId, hospitalId) {
  const { rowCount } = await getPool().query(
    `SELECT 1 FROM hospital_providers WHERE doctor_id = $1 AND hospital_id = $2 AND deleted_at IS NULL`,
    [providerId, hospitalId]);
  return rowCount > 0;
}

async function addOpd(providerId, o) {
  if (!providerId) throw new Error('No provider');
  const days = (Array.isArray(o.day_of_week) ? o.day_of_week : []).map((d) => parseInt(d, 10)).filter((d) => d >= 0 && d <= 6);
  if (!days.length || !o.hospital_id || !o.start_time || !o.end_time) return { ok: false };
  if (!(await isAffiliated(providerId, o.hospital_id))) return { ok: false, error: 'not_affiliated' };
  await getPool().query(
    `INSERT INTO opd_schedules
       (provider_id, hospital_id, day_of_week, start_time, end_time, consultation_type, max_tokens, notes_en)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [providerId, o.hospital_id, days, o.start_time, o.end_time,
     o.consultation_type || 'outpatient', Number.isFinite(o.max_tokens) ? o.max_tokens : null, o.notes_en || null]);
  return { ok: true };
}

/** Toggle active or update times — patch fields. Owner-scoped. */
async function updateOpd(providerId, id, fields) {
  if (!providerId) throw new Error('No provider');
  const sets = ['updated_at = now()'];
  const values = [];
  const push = (col, val) => { values.push(val); sets.push(`${col} = $${values.length}`); };
  if (typeof fields.is_active === 'boolean') push('is_active', fields.is_active);
  if (fields.start_time) push('start_time', fields.start_time);
  if (fields.end_time) push('end_time', fields.end_time);
  if (fields.max_tokens !== undefined) push('max_tokens', fields.max_tokens);
  if (sets.length === 1) return { ok: false };
  values.push(id); values.push(providerId);
  const { rowCount } = await getPool().query(
    `UPDATE opd_schedules SET ${sets.join(', ')} WHERE id = $${values.length - 1} AND provider_id = $${values.length}`, values);
  return { ok: rowCount > 0 };
}

async function removeOpd(providerId, id) {
  const { rowCount } = await getPool().query(
    `DELETE FROM opd_schedules WHERE id = $1 AND provider_id = $2`, [id, providerId]);
  return { ok: rowCount > 0 };
}

export { myAffiliatedHospitals, myOpd, addOpd, updateOpd, removeOpd };
