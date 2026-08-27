import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const reports = await sql`
      SELECT
        id,
        test_name,
        lab_name,
        test_date,
        results,
        file_url,
        status,
        normal_range,
        created_at
      FROM lab_reports
      WHERE patient_id = ${session.userId}
      AND deleted_at IS NULL
      ORDER BY test_date DESC
      LIMIT 50
    `

    return Response.json({ data: reports })
  } catch (error) {
    console.error('Lab reports error:', error)
    return Response.json({ error: 'Failed to fetch lab reports' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { test_name, lab_name, results, file_url, status = 'pending' } = await req.json()

    const result = await sql`
      INSERT INTO lab_reports (patient_id, test_name, lab_name, test_date, results, file_url, status)
      VALUES (${session.userId}, ${test_name}, ${lab_name}, NOW(), ${JSON.stringify(results)}, ${file_url}, ${status})
      RETURNING id, test_name, status
    `

    return Response.json({ ok: true, report: result[0] })
  } catch (error) {
    console.error('Upload lab report error:', error)
    return Response.json({ error: 'Failed to upload report' }, { status: 500 })
  }
}
