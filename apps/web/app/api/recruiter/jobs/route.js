import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const jobs = await sql`SELECT id, title, specialty, location, salary_min, salary_max, job_type, posted_date, applications_count, views_count FROM jobs WHERE recruiter_id = ${session.userId} AND deleted_at IS NULL ORDER BY posted_date DESC LIMIT 20`
    return Response.json(jobs)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { title, specialty, location, salary_min, salary_max, description, job_type, shift, experience_required } = await req.json()
    const result = await sql`INSERT INTO jobs (recruiter_id, title, specialty, location, salary_min, salary_max, description, job_type, shift, experience_required, status) VALUES (${session.userId}, ${title}, ${specialty}, ${location}, ${salary_min}, ${salary_max}, ${description}, ${job_type}, ${shift}, ${experience_required}, 'active') RETURNING id, title, status`
    return Response.json(result[0])
  } catch (error) {
    return Response.json({ error: 'Failed to post job' }, { status: 500 })
  }
}
