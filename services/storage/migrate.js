// migrate.js — one-off migration of base64 data-URI files into S3/R2.
// Usage (from repo root, with DATABASE_URL + S3_* set):
//   node services/storage/migrate.js
// Scans private file tables + doctor photos, uploads each data URI, and rewrites
// the stored reference (private -> "s3:<key>", public photo -> public URL).
// Idempotent: only rows whose URL still starts with "data:" are processed.

import { getPool } from '@khp/db';
import { uploadFile, isConfigured } from './index.js';

const parseDataUri = (s) => {
  const m = /^data:([^;]+);base64,(.*)$/s.exec(String(s || ''));
  return m ? { contentType: m[1], buffer: Buffer.from(m[2], 'base64') } : null;
};
const ext = (ct) => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'application/pdf': 'pdf' }[ct] || 'bin');

async function migrateTable(pool, { table, urlCol, ownerCol, folder, isPrivate }) {
  const { rows } = await pool.query(
    `SELECT id, ${urlCol} AS url${ownerCol ? `, ${ownerCol} AS owner` : ''}
       FROM ${table} WHERE ${urlCol} LIKE 'data:%'`
  );
  let ok = 0, skipped = 0, failed = 0;
  for (const r of rows) {
    const parsed = parseDataUri(r.url);
    if (!parsed) { skipped++; continue; }
    try {
      const owner = r.owner || 'shared';
      const { key, url } = await uploadFile(parsed.buffer, `${r.id}.${ext(parsed.contentType)}`, parsed.contentType, `${folder}/${owner}`);
      await pool.query(`UPDATE ${table} SET ${urlCol} = $1, updated_at = now() WHERE id = $2`,
        [isPrivate ? `s3:${key}` : url, r.id]);
      ok++;
    } catch (err) {
      console.error(`  [${table}:${r.id}] ${err.message}`);
      failed++;
    }
  }
  return { table, total: rows.length, ok, skipped, failed };
}

const TARGETS = [
  { table: 'prescriptions', urlCol: 'file_url', ownerCol: 'user_id', folder: 'prescriptions', isPrivate: true },
  { table: 'lab_reports', urlCol: 'file_url', ownerCol: 'user_id', folder: 'lab-reports', isPrivate: true },
  { table: 'health_records', urlCol: 'file_url', ownerCol: 'user_id', folder: 'documents', isPrivate: true },
  { table: 'doctors', urlCol: 'photo_url', ownerCol: 'id', folder: 'profile-photos', isPrivate: false }
];

export async function runMigration() {
  if (!isConfigured()) {
    console.log('S3/R2 not configured (set S3_BUCKET, S3_ACCESS_KEY, S3_SECRET_KEY). Nothing to do.');
    return [];
  }
  const pool = getPool();
  const results = [];
  for (const t of TARGETS) {
    try { results.push(await migrateTable(pool, t)); }
    catch (err) { console.error(`table ${t.table} failed: ${err.message}`); results.push({ table: t.table, error: err.message }); }
  }
  console.table(results);
  return results;
}

// Run when invoked directly.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('migrate.js')) {
  runMigration().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
