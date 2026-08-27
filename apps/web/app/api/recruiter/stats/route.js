import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const activeJobs = await sql`SELECT COUNT(*) as count FROM jobs WHERE recruiter_id = ${session.userId} AND status = 'active' AND deleted_at IS NULL`
    const totalApplications = await sql`SELECT COUNT(*) as count FROM job_applications ja JOIN jobs j ON ja.job_id = j.id WHERE j.recruiter_id = ${session.userId} AND ja.deleted_at IS NULL`
    const hiredThisMonth = await sql`SELECT COUNT(*) as count FROM job_applications ja JOIN jobs j ON ja.job_id = j.id WHERE j.recruiter_id = ${session.userId} AND ja.status = 'accepted' AND ja.reviewed_date >= NOW() - INTERVAL '30 days'`

    return Response.json({
      activeJobs: activeJobs[0]?.count || 0,
      totalApplications: totalApplications[0]?.count || 0,
      hiredThisMonth: hiredThisMonth[0]?.count || 0,
      avgResponseTime: 24,
      profileViews: 0
    })
  } catch (error) {
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
