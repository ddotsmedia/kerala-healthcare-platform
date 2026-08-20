// importJobs.js — import_jobs data access (admin). Fails soft on read.

import { getPool } from '@khp/db';

async function run(text, values = []) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`import job query failed: ${err.message}`); return []; }
}

export async function createJob({ adminUserId, type, filename, totalRows, preview, rawCsv }) {
  const rows = await run(
    `INSERT INTO import_jobs (admin_user_id, type, filename, total_rows, status, preview, raw_csv)
     VALUES ($1,$2,$3,$4,'pending',$5,$6) RETURNING id`,
    [adminUserId || null, type, filename || null, totalRows, JSON.stringify(preview || null), rawCsv || null]);
  return rows[0]?.id || null;
}

export function getJob(id) {
  return run(`SELECT * FROM import_jobs WHERE id = $1 AND deleted_at IS NULL`, [id]).then((r) => r[0] || null);
}

export function listJobs(limit = 20) {
  return run(
    `SELECT id, type, filename, total_rows, success_rows, error_rows, status, created_at
       FROM import_jobs WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1`, [limit]);
}

export async function finishJob(id, { success, errorRows, errors, total }) {
  // Convert a JSON array ($5) into jsonb[] via jsonb_array_elements + array_agg.
  await run(
    `UPDATE import_jobs SET status='completed', processed_rows=$2, success_rows=$3,
        error_rows=$4,
        errors = COALESCE((SELECT array_agg(e) FROM jsonb_array_elements($5::jsonb) e), '{}'::jsonb[]),
        updated_at=now() WHERE id=$1`,
    [id, total, success, errorRows, JSON.stringify(errors || [])]);
}
