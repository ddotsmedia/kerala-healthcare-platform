import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const filter = url.searchParams.get('filter') || 'all'

  try {
    let query = `
      SELECT j.*, jr.match_percentage, jr.reason,
             r.company_name as employer
      FROM job_recommendations jr
      JOIN jobs j ON jr.job_id = j.id
      LEFT JOIN recruiter_accounts r ON j.recruiter_id = r.user_id
      WHERE jr.user_id = $1 AND j.status = 'active' AND j.deleted_at IS NULL
    `

    if (filter === 'matching') query += ` AND jr.match_percentage >= 80`
    else if (filter === 'trending') query += ` ORDER BY j.views_count DESC`
    else if (filter === 'new') query += ` ORDER BY j.posted_date DESC`

    query += ` ORDER BY jr.match_percentage DESC LIMIT 30`

    const jobs = await sql(query, [session.userId])
    return Response.json(jobs)
  } catch (error) {
    console.error('Recommendations error:', error)
    return Response.json({ error: 'Failed to fetch recommendations' }, { status: 500 })
  }
}
