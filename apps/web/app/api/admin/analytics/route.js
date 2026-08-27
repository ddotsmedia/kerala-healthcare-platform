import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session?.role?.includes('admin')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM users WHERE deleted_at IS NULL) as total_users,
        (SELECT COUNT(*) FROM appointments WHERE deleted_at IS NULL) as total_appointments,
        (SELECT COUNT(*) FROM doctors WHERE verified = true AND deleted_at IS NULL) as active_doctors,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE status = 'completed') as total_revenue,
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days' AND deleted_at IS NULL) as new_users_month,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE created_at >= NOW() - INTERVAL '30 days') as revenue_month
    `

    const topDoctors = await sql`
      SELECT d.id, d.full_name, COUNT(a.id) as appointments, AVG(a.rating) as rating
      FROM doctors d
      LEFT JOIN appointments a ON d.id = a.doctor_id AND a.deleted_at IS NULL
      WHERE d.deleted_at IS NULL
      GROUP BY d.id
      ORDER BY appointments DESC
      LIMIT 5
    `

    const appointmentTrend = await sql`
      SELECT DATE(scheduled_at) as date, COUNT(*) as count
      FROM appointments
      WHERE deleted_at IS NULL AND scheduled_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(scheduled_at)
      ORDER BY date DESC
    `

    return Response.json({
      stats: stats[0],
      topDoctors,
      appointmentTrend
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
