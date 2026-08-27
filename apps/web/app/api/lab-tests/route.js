import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  try {
    const tests = await sql`
      SELECT
        id,
        test_name,
        test_code,
        description,
        price,
        estimated_turnaround_hours,
        sample_type,
        fasting_required,
        created_at
      FROM lab_tests
      WHERE active = true AND deleted_at IS NULL
      ORDER BY test_name ASC
      LIMIT 100
    `

    return Response.json({ data: tests })
  } catch (error) {
    console.error('Lab tests error:', error)
    return Response.json({ error: 'Failed to fetch lab tests' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { test_id, collection_date, collection_time, notes } = await req.json()

    const test = await sql`
      SELECT test_name, price FROM lab_tests WHERE id = ${test_id}
    `

    const booking = await sql`
      INSERT INTO lab_test_bookings (patient_id, test_id, collection_date, collection_time, status, notes)
      VALUES (${session.userId}, ${test_id}, ${collection_date}, ${collection_time}, 'confirmed', ${notes})
      RETURNING id, status
    `

    return Response.json({
      ok: true,
      booking: booking[0],
      test_name: test[0]?.test_name,
      price: test[0]?.price
    })
  } catch (error) {
    console.error('Book lab test error:', error)
    return Response.json({ error: 'Failed to book lab test' }, { status: 500 })
  }
}
