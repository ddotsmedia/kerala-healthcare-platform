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
    // Check for job_alerts pending (not yet sent)
    const alertResult = await pool.query(`
      SELECT COUNT(*) as count FROM job_alerts
      WHERE is_active = true AND deleted_at IS NULL
    `);

    // Check for appointment_reminders pending (sent_at IS NULL and remind_at <= now)
    const reminderResult = await pool.query(`
      SELECT COUNT(*) as count FROM appointment_reminders
      WHERE sent_at IS NULL AND remind_at <= NOW() AND deleted_at IS NULL
    `);

    const pendingAlerts = parseInt(alertResult.rows[0]?.count || 0);
    const pendingReminders = parseInt(reminderResult.rows[0]?.count || 0);

    return NextResponse.json({
      pendingAlerts,
      pendingReminders,
      total: pendingAlerts + pendingReminders,
      source: 'table-proxy'
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    console.error('Jobs monitoring error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job metrics' },
      { status: 500 }
    );
  }
}
