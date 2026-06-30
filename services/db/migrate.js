// migrate.js
// CLI entry for `pnpm db:migrate`. Applies pending additive migrations.

import { getPool, closePool } from './pool.js';
import { runMigrations } from './runner.js';

async function main() {
  const pool = getPool();
  const applied = await runMigrations(pool);
  if (applied.length === 0) {
    console.log('No pending migrations. Schema up to date.');
  } else {
    console.log(`Applied ${applied.length} migration(s):`);
    applied.forEach((f) => console.log(`  + ${f}`));
  }
}

main()
  .then(closePool)
  .catch(async (err) => {
    console.error(`Migration error: ${err.message}`);
    await closePool();
    process.exit(1);
  });
