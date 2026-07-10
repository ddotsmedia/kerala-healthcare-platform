// labReports.js — patient lab report storage. Strictly user-scoped. File as
// base64 data URI (<=2MB) until S3/R2 (H3).

import { getPool } from '@khp/db';
import { MARKER_KEYS } from './labMarkers.js';

const MAX_FILE_KB = 2048;
const FILE_TYPES = { 'image/jpeg': 'jpg', 'image/png': 'png', 'application/pdf': 'pdf' };
const META_COLS = `id, lab_name, report_date, report_type, file_name, file_type, file_size_kb,
  results, notes, ordered_by_doctor, created_at, updated_at`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`lab-reports query failed: ${err.message}`); return []; }
}

/** Keep only known markers with a finite numeric value. */
function cleanResults(results) {
  const out = {};
  if (results && typeof results === 'object') {
    for (const k of MARKER_KEYS) {
      const r = results[k];
      if (r && r.value !== '' && r.value != null && Number.isFinite(Number(r.value))) {
        out[k] = {
          value: Number(r.value), unit: r.unit ? String(r.unit).slice(0, 20) : '',
          normal_min: r.normal_min != null && r.normal_min !== '' ? Number(r.normal_min) : null,
          normal_max: r.normal_max != null && r.normal_max !== '' ? Number(r.normal_max) : null
        };
      }
    }
  }
  return out;
}

async function listLabReports(userId, q) {
  if (!userId) return [];
  const values = [userId];
  let where = 'user_id = $1 AND deleted_at IS NULL';
  if (q) { values.push(`%${q}%`); where += ` AND (lab_name ILIKE $2 OR report_type ILIKE $2 OR ordered_by_doctor ILIKE $2)`; }
  return run(`SELECT ${META_COLS}, (file_url IS NOT NULL) AS has_file
                FROM lab_reports WHERE ${where} ORDER BY report_date DESC, created_at DESC`, values);
}

async function getLabReport(userId, id) {
  if (!userId) return null;
  const rows = await run(`SELECT ${META_COLS}, (file_url IS NOT NULL) AS has_file
                            FROM lab_reports WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`, [id, userId]);
  return rows[0] || null;
}

async function getLabReportFile(userId, id) {
  if (!userId) return null;
  const rows = await run(`SELECT file_url, file_type, file_name FROM lab_reports
                           WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL`, [id, userId]);
  return rows[0] || null;
}

async function createLabReport(userId, b) {
  if (!userId || !b.report_date) return null;
  const rows = await run(
    `INSERT INTO lab_reports
       (user_id, lab_name, report_date, report_type, file_url, file_name, file_type, file_size_kb,
        results, notes, ordered_by_doctor)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11)
     RETURNING ${META_COLS}`,
    [userId, b.lab_name || null, b.report_date, b.report_type || null, b.file_data_uri || null,
     b.file_name || null, b.file_type || null, b.file_size_kb || null,
     JSON.stringify(cleanResults(b.results)), b.notes ? String(b.notes).slice(0, 1000) : null,
     b.ordered_by_doctor || null]);
  return rows[0] || null;
}

async function updateLabReport(userId, id, fields) {
  if (!userId) return null;
  const sets = ['updated_at = now()'];
  const values = [];
  const push = (col, val, cast) => { values.push(val); sets.push(`${col} = $${values.length}${cast || ''}`); };
  if (fields.lab_name !== undefined) push('lab_name', fields.lab_name || null);
  if (fields.report_date) push('report_date', fields.report_date);
  if (fields.report_type !== undefined) push('report_type', fields.report_type || null);
  if (fields.ordered_by_doctor !== undefined) push('ordered_by_doctor', fields.ordered_by_doctor || null);
  if (fields.notes !== undefined) push('notes', fields.notes ? String(fields.notes).slice(0, 1000) : null);
  if (fields.results !== undefined) push('results', JSON.stringify(cleanResults(fields.results)), '::jsonb');
  if (sets.length === 1) return false;
  values.push(id); values.push(userId);
  const rows = await run(`UPDATE lab_reports SET ${sets.join(', ')}
                            WHERE id = $${values.length - 1} AND user_id = $${values.length} AND deleted_at IS NULL
                          RETURNING ${META_COLS}`, values);
  return rows[0] || false;
}

async function deleteLabReport(userId, id) {
  if (!userId) return null;
  const rows = await run(`UPDATE lab_reports SET deleted_at = now(), updated_at = now()
                            WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL RETURNING id`, [id, userId]);
  return rows[0] || false;
}

export {
  listLabReports, getLabReport, getLabReportFile, createLabReport, updateLabReport,
  deleteLabReport, cleanResults, MAX_FILE_KB, FILE_TYPES
};
