// pool.js
// Single shared PostgreSQL connection pool, created lazily from DATABASE_URL.

import pg from 'pg';

let pool = null;

/**
 * @returns {pg.Pool} the shared pool.
 * @throws if DATABASE_URL is not set.
 */
function getPool() {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }
  pool = new pg.Pool({ connectionString, max: 10 });
  return pool;
}

/** Close the pool (tests / graceful shutdown). */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export { getPool, closePool };
