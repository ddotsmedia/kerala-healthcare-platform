import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const prescriptions = await sql`
      SELECT
        p.id,
        p.issue_date,
        p.expiry_date,
        p.medications,
        p.dosage,
        p.duration,
        p.refills_left,
        d.full_name as doctor_name,
        d.id as doctor_id
      FROM prescriptions p
      JOIN doctors d ON p.doctor_id = d.id
      WHERE p.patient_id = ${session.userId}
      AND p.deleted_at IS NULL
      ORDER BY p.issue_date DESC
      LIMIT 100
    `
    return Response.json({ data: prescriptions })
  } catch (error) {
    console.error('Prescriptions error:', error)
    return Response.json({ error: 'Failed to fetch prescriptions' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { prescription_id } = await req.json()

    const result = await sql`
      SELECT refills_left FROM prescriptions
      WHERE id = ${prescription_id} AND patient_id = ${session.userId}
    `

    if (!result[0] || result[0].refills_left <= 0) {
      return Response.json({ error: 'No refills available' }, { status: 400 })
    }

    await sql`
      UPDATE prescriptions
      SET refills_left = refills_left - 1, updated_at = NOW()
      WHERE id = ${prescription_id}
    `

    return Response.json({ ok: true, refills_left: result[0].refills_left - 1 })
  } catch (error) {
    console.error('Refill error:', error)
    return Response.json({ error: 'Failed to process refill' }, { status: 500 })
  }
}
