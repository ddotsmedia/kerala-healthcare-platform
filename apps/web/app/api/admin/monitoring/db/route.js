import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getPool } from '@khp/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session?.role?.includes('admin')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const pool = getPool();

  try {
    // Measure DB ping time
    const startMs = Date.now();
    await pool.query('SELECT 1');
    const pingMs = Date.now() - startMs;

    // Get connection stats
    const connStats = await pool.query(`
      SELECT
        (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,
        (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'idle') as idle_connections
    `);

    const { active_connections, idle_connections } = connStats.rows[0];

    // Get longest running queries
    const longQueries = await pool.query(`
      SELECT
        duration as duration_seconds,
        query
      FROM pg_stat_activity
      WHERE state = 'active'
      ORDER BY duration DESC
      LIMIT 5
    `);

    // Get largest tables
    const largestTables = await pool.query(`
      SELECT
        schemaname,
        tablename as name,
        ROUND(pg_total_relation_size(schemaname || '.' || tablename) / 1024 / 1024) as size_mb
      FROM pg_tables
      WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
      ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC
      LIMIT 10
    `);

    return NextResponse.json({
      pingMs,
      activeConnections: parseInt(active_connections),
      idleConnections: parseInt(idle_connections),
      longestRunningQueries: longQueries.rows.map(row => ({
        durationSeconds: row.duration_seconds,
        query: (row.query || '').substring(0, 200)
      })),
      largestTables: largestTables.rows.map(row => ({
        name: row.name,
        sizeMB: row.size_mb
      }))
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('DB monitoring error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database metrics' },
      { status: 500 }
    );
  }
}
