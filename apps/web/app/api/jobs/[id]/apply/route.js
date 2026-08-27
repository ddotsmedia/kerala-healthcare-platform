import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function POST(req, { params }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const { resume_id, cover_letter } = await req.json()

    const existing = await sql`SELECT id FROM job_applications WHERE job_id = ${id} AND candidate_id = ${session.userId}`
    if (existing[0]) return Response.json({ error: 'Already applied' }, { status: 400 })

    const result = await sql`INSERT INTO job_applications (job_id, candidate_id, resume_id, cover_letter, status, applied_date) VALUES (${id}, ${session.userId}, ${resume_id}, ${cover_letter}, 'applied', NOW()) RETURNING id, status`
    await sql`UPDATE jobs SET applications_count = applications_count + 1 WHERE id = ${id}`

    return Response.json({ ok: true, application: result[0] })
  } catch (error) {
    return Response.json({ error: 'Failed to apply' }, { status: 500 })
  }
}
