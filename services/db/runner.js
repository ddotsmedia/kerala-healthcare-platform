// runner.js
// Apply additive SQL migrations in order, once each, tracked in schema_migrations.
// Additive only — this runner never drops or rolls back applied migrations.

import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const MIGRATIONS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'migrations');
const MIGRATION_FILE = /^\d{4}_.+\.sql$/;

/** List migration filenames in numeric order. */
function listMigrations() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => MIGRATION_FILE.test(f))
    .sort();
}

function checksum(sql) {
  return createHash('sha256').update(sql).digest('hex');
}

/** Ensure the tracking table exists (additive). */
async function ensureTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename   text PRIMARY KEY,
      checksum   text NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
}

/** @returns {Promise<Map<string,string>>} filename -> checksum already applied. */
async function appliedMap(client) {
  const { rows } = await client.query('SELECT filename, checksum FROM schema_migrations');
  return new Map(rows.map((r) => [r.filename, r.checksum]));
}

/**
 * Run all pending migrations.
 * @param {import('pg').Pool} pool
 * @returns {Promise<string[]>} filenames applied this run.
 */
async function runMigrations(pool) {
  const client = await pool.connect();
  const applied = [];
  try {
    await ensureTable(client);
    const done = await appliedMap(client);
    for (const filename of listMigrations()) {
      const sql = readFileSync(join(MIGRATIONS_DIR, filename), 'utf8');
      const sum = checksum(sql);
      if (done.has(filename)) {
        if (done.get(filename) !== sum) {
          throw new Error(`Migration ${filename} changed after being applied (checksum mismatch)`);
        }
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename, checksum) VALUES ($1, $2)',
          [filename, sum]
        );
        await client.query('COMMIT');
        applied.push(filename);
      } catch (err) {
        await client.query('ROLLBACK');
        throw new Error(`Migration ${filename} failed: ${err.message}`);
      }
    }
    return applied;
  } finally {
    client.release();
  }
}

export { runMigrations, listMigrations, MIGRATIONS_DIR };
