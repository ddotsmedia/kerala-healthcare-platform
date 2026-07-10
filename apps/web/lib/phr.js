// phr.js — Personal Health Records data access. Strictly patient-owned:
// every query is scoped by user_id. Parameterised SQL only. Fails soft.

import { getPool } from '@khp/db';

async function run(text, values = []) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`phr query failed: ${err.message}`); return []; }
}

const RECORD_TYPES = ['prescription', 'lab_report', 'imaging', 'vaccination', 'allergy', 'medication', 'condition', 'surgery', 'note'];
const SEVERITIES = ['mild', 'moderate', 'severe', 'life-threatening'];
export const isRecordType = (t) => RECORD_TYPES.includes(t);

// ---- records ----
export function listRecords(userId, type, memberId) {
  const vals = [userId]; let where = 'user_id = $1 AND deleted_at IS NULL';
  vals.push(memberId || null); where += ` AND family_member_id IS NOT DISTINCT FROM $${vals.length}`;
  if (type && isRecordType(type)) { vals.push(type); where += ` AND record_type = $${vals.length}`; }
  return run(`SELECT id, record_type, title, description, record_date, file_name, file_size_kb,
                     doctor_name, hospital_name, tags, created_at
                FROM health_records WHERE ${where} ORDER BY record_date DESC NULLS LAST, created_at DESC`, vals);
}
export async function createRecord(userId, b) {
  if (!isRecordType(b.record_type) || !b.title) return null;
  const rows = await run(
    `INSERT INTO health_records (user_id, record_type, title, description, record_date, file_name, file_size_kb, doctor_name, hospital_name, tags, family_member_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
    [userId, b.record_type, String(b.title).slice(0, 200), b.description || null, b.record_date || null,
     b.file_name || null, b.file_size_kb || null, b.doctor_name || null, b.hospital_name || null,
     Array.isArray(b.tags) ? b.tags : null, b.family_member_id || null]);
  return rows[0]?.id || null;
}
export async function updateRecord(id, userId, b) {
  const rows = await run(
    `UPDATE health_records SET title = COALESCE($3,title), description = $4, record_date = $5,
            doctor_name = $6, hospital_name = $7, updated_at = now()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id`,
    [id, userId, b.title || null, b.description || null, b.record_date || null, b.doctor_name || null, b.hospital_name || null]);
  return rows.length > 0;
}
export async function deleteRecord(id, userId) {
  const rows = await run(`UPDATE health_records SET deleted_at = now() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id`, [id, userId]);
  return rows.length > 0;
}

// ---- allergies ----
export function listAllergies(userId) {
  return run(`SELECT id, allergen, reaction, severity, noted_at FROM patient_allergies
               WHERE user_id = $1 AND deleted_at IS NULL ORDER BY created_at DESC`, [userId]);
}
export async function addAllergy(userId, b) {
  if (!b.allergen) return null;
  const sev = SEVERITIES.includes(b.severity) ? b.severity : null;
  const rows = await run(`INSERT INTO patient_allergies (user_id, allergen, reaction, severity, noted_at)
                          VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [userId, String(b.allergen).slice(0, 120), b.reaction || null, sev, b.noted_at || null]);
  return rows[0]?.id || null;
}
export async function deleteAllergy(id, userId) {
  const rows = await run(`UPDATE patient_allergies SET deleted_at = now() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id`, [id, userId]);
  return rows.length > 0;
}

// ---- medications ----
export function listMedications(userId) {
  return run(`SELECT id, medication_name, dosage, frequency, prescribed_by, start_date, end_date, is_ongoing, notes
                FROM patient_medications WHERE user_id = $1 AND deleted_at IS NULL ORDER BY is_ongoing DESC, created_at DESC`, [userId]);
}
export async function addMedication(userId, b) {
  if (!b.medication_name) return null;
  const rows = await run(
    `INSERT INTO patient_medications (user_id, medication_name, dosage, frequency, prescribed_by, start_date, end_date, is_ongoing, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [userId, String(b.medication_name).slice(0, 200), b.dosage || null, b.frequency || null, b.prescribed_by || null,
     b.start_date || null, b.end_date || null, !!b.is_ongoing, b.notes || null]);
  return rows[0]?.id || null;
}
export async function updateMedication(id, userId, b) {
  const rows = await run(
    `UPDATE patient_medications SET dosage = $3, frequency = $4, end_date = $5,
            is_ongoing = COALESCE($6, is_ongoing), notes = $7, updated_at = now()
      WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id`,
    [id, userId, b.dosage || null, b.frequency || null, b.end_date || null,
     typeof b.is_ongoing === 'boolean' ? b.is_ongoing : null, b.notes || null]);
  return rows.length > 0;
}
export async function deleteMedication(id, userId) {
  const rows = await run(`UPDATE patient_medications SET deleted_at = now() WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id`, [id, userId]);
  return rows.length > 0;
}

export async function phrSummary(userId) {
  const [a, m, r] = await Promise.all([
    run(`SELECT count(*)::int n FROM patient_allergies WHERE user_id=$1 AND deleted_at IS NULL`, [userId]),
    run(`SELECT count(*)::int n FROM patient_medications WHERE user_id=$1 AND is_ongoing=true AND deleted_at IS NULL`, [userId]),
    run(`SELECT count(*)::int n FROM health_records WHERE user_id=$1 AND deleted_at IS NULL`, [userId])
  ]);
  return { allergies: a[0]?.n || 0, medications: m[0]?.n || 0, records: r[0]?.n || 0 };
}
