import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session?.role?.includes('admin')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const users = await sql`SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL`
    const appointments = await sql`SELECT COUNT(*) as count FROM appointments WHERE deleted_at IS NULL`
    const doctors = await sql`SELECT COUNT(*) as count FROM doctors WHERE verified = true AND deleted_at IS NULL`
    const pendingDoctors = await sql`SELECT COUNT(*) as count FROM doctors WHERE verified = false AND deleted_at IS NULL`
    const revenue = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE deleted_at IS NULL`
    const usersMonth = await sql`SELECT COUNT(*) as count FROM users WHERE deleted_at IS NULL AND created_at >= CURRENT_DATE - INTERVAL '30 days'`
    const apptMonth = await sql`SELECT COUNT(*) as count FROM appointments WHERE deleted_at IS NULL AND created_at >= CURRENT_DATE - INTERVAL '30 days'`
    const revenueMonth = await sql`SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE deleted_at IS NULL AND created_at >= CURRENT_DATE - INTERVAL '30 days'`
    const recentUsers = await sql`SELECT id, full_name as name, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 5`
    const recentAppts = await sql`SELECT a.id, p.full_name as patientName, d.full_name as doctorName, a.scheduled_at as date FROM appointments a JOIN users p ON a.patient_id = p.id JOIN doctors d ON a.doctor_id = d.id WHERE a.deleted_at IS NULL ORDER BY a.scheduled_at DESC LIMIT 5`

    return Response.json({
      totalUsers: users[0].count,
      totalAppointments: appointments[0].count,
      activeDoctors: doctors[0].count,
      pendingDoctors: pendingDoctors[0].count,
      totalRevenue: Number(revenue[0].total),
      usersThisMonth: usersMonth[0].count,
      appointmentsThisMonth: apptMonth[0].count,
      revenueThisMonth: Number(revenueMonth[0].total),
      recentUsers: recentUsers,
      recentAppointments: recentAppts
    })
  } catch (error) {
    console.error('Dashboard stats error:', error)
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
