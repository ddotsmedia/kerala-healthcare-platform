import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  try {
    const nurses = await sql`
      SELECT
        id,
        user_id,
        name,
        qualification,
        experience_years,
        hourly_rate,
        languages,
        availability_status,
        rating,
        total_bookings,
        certifications,
        created_at
      FROM nursing_services
      WHERE availability_status = 'available' AND deleted_at IS NULL
      ORDER BY rating DESC, total_bookings DESC
      LIMIT 50
    `

    return Response.json({ data: nurses })
  } catch (error) {
    console.error('Nursing services error:', error)
    return Response.json({ error: 'Failed to fetch nursing services' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { nurse_id, start_date, end_date, notes } = await req.json()

    const result = await sql`
      INSERT INTO nursing_bookings (patient_id, nurse_id, start_date, end_date, status, notes)
      VALUES (${session.userId}, ${nurse_id}, ${start_date}, ${end_date}, 'pending', ${notes})
      RETURNING id, status
    `

    return Response.json({ ok: true, booking: result[0] })
  } catch (error) {
    console.error('Book nursing error:', error)
    return Response.json({ error: 'Failed to book nursing service' }, { status: 500 })
  }
}
