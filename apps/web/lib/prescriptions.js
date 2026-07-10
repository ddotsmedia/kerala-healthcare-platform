// prescriptions.js — patient prescription storage. Strictly user-scoped.
// File is stored as a base64 data URI in file_url (max 2MB) until S3/R2 (H3).

import { getPool } from '@khp/db';

const MAX_FILE_KB = 2048;
const FILE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'application/pdf': 'pdf' };
const META_COLS = `id, appointment_id, doctor_name, doctor_id, hospital_name, prescribed_date,
  valid_until, medications, file_name, file_type, file_size_kb, notes, tags, created_at, updated_at`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`prescriptions query failed: ${err.message}`); return []; }
}

/** List (metadata only — no file blob). memberId: null/'' = self, else that member. */
async function listPrescriptions(userId, q, memberId) {
  if (!userId) return [];
  const values = [userId];
  let where = 'user_id = $1 AND deleted_at IS NULL';
  values.push(memberId || null);
  where += ` AND family_member_id IS NOT DISTINCT FROM $${values.length}`;
  if (q) {
    values.push(`%${q}%`);
    where += ` AND (doctor_name ILIKE $${values.length} OR hospital_name ILIKE $${values.length} OR medications::text ILIKE $${values.length})`;
  }
  return run(`SELECT ${META_COLS}, (file_url IS NOT NULL) AS has_file
                FROM prescriptions WHERE ${where}
               ORDER BY prescribed_date DESC NULLS LAST, created_at DESC`, values);
}

async function getPrescription(userId, id) {
  if (!userId) return null;
  const rows = await run(`SELECT ${META_COLS}, (file_url IS NOT NULL) AS has_file
                            FROM prescriptions WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`, [id, userId]);
  return rows[0] || null;
}

/** Returns the raw data URI for the file route (owner-scoped). */
async function getPrescriptionFile(userId, id) {
  if (!userId) return null;
  const rows = await run(`SELECT file_url, file_type, file_name FROM prescriptions
                           WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`, [id, userId]);
  return rows[0] || null;
}

function cleanMeds(meds) {
  if (!Array.isArray(meds)) return [];
  return meds.filter((m) => m && m.name).slice(0, 50).map((m) => ({
    name: String(m.name).slice(0, 120), dosage: m.dosage ? String(m.dosage).slice(0, 60) : '',
    frequency: m.frequency ? String(m.frequency).slice(0, 60) : '', duration: m.duration ? String(m.duration).slice(0, 60) : '',
    notes: m.notes ? String(m.notes).slice(0, 200) : ''
  }));
}

/** @param {object} b metadata + optional { file_data_uri, file_name, file_type, file_size_kb } */
async function createPrescription(userId, b) {
  if (!userId) return null;
  const rows = await run(
    `INSERT INTO prescriptions
       (user_id, appointment_id, doctor_name, hospital_name, prescribed_date, valid_until,
        medications, file_url, file_name, file_type, file_size_kb, notes, tags, family_member_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10,$11,$12,$13,$14)
     RETURNING ${META_COLS}`,
    [userId, b.appointment_id || null, b.doctor_name || null, b.hospital_name || null,
     b.prescribed_date || null, b.valid_until || null, JSON.stringify(cleanMeds(b.medications)),
     b.file_data_uri || null, b.file_name || null, b.file_type || null, b.file_size_kb || null,
     b.notes ? String(b.notes).slice(0, 1000) : null, Array.isArray(b.tags) ? b.tags.slice(0, 20) : null,
     b.family_member_id || null]);
  return rows[0] || null;
}

async function updatePrescription(userId, id, fields) {
  if (!userId) return null;
  const sets = ['updated_at = now()'];
  const values = [];
  const push = (col, val, cast) => { values.push(val); sets.push(`${col} = $${values.length}${cast || ''}`); };
  if (fields.doctor_name !== undefined) push('doctor_name', fields.doctor_name || null);
  if (fields.hospital_name !== undefined) push('hospital_name', fields.hospital_name || null);
  if (fields.prescribed_date !== undefined) push('prescribed_date', fields.prescribed_date || null);
  if (fields.valid_until !== undefined) push('valid_until', fields.valid_until || null);
  if (fields.notes !== undefined) push('notes', fields.notes ? String(fields.notes).slice(0, 1000) : null);
  if (fields.medications !== undefined) push('medications', JSON.stringify(cleanMeds(fields.medications)), '::jsonb');
  if (Array.isArray(fields.tags)) push('tags', fields.tags.slice(0, 20));
  if (sets.length === 1) return false;
  values.push(id); values.push(userId);
  const rows = await run(`UPDATE prescriptions SET ${sets.join(', ')}
                            WHERE id = $${values.length - 1} AND user_id = $${values.length} AND deleted_at IS NULL
                          RETURNING ${META_COLS}`, values);
  return rows[0] || false;
}

async function deletePrescription(userId, id) {
  if (!userId) return null;
  const rows = await run(`UPDATE prescriptions SET deleted_at = now(), updated_at = now()
                            WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id`, [id, userId]);
  return rows[0] || false;
}

export {
  listPrescriptions, getPrescription, getPrescriptionFile, createPrescription,
  updatePrescription, deletePrescription, MAX_FILE_KB, FILE_TYPES
};
