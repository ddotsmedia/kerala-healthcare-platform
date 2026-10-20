// services/db — PostgreSQL pool + additive migration runner.

import { getPool } from './pool.js';

export { getPool, closePool } from './pool.js';
export { runMigrations, listMigrations } from './runner.js';

// sql template helper for parameterized queries
export function sql(strings, ...values) {
  return getPool().query({
    text: strings.join('?'),
    values,
    rowMode: 'object'
  }).then(r => r.rows);
}
