import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const waitlist = await sql`
      SELECT
        w.id,
        w.appointment_id,
        w.queue_position,
        w.status,
        w.created_at,
        a.scheduled_at,
        d.full_name as doctor_name,
        d.id as doctor_id,
        COUNT(*) OVER (PARTITION BY w.appointment_id ORDER BY w.queue_position) as total_ahead
      FROM appointment_waiting_list w
      JOIN appointments a ON w.appointment_id = a.id
      JOIN doctors d ON a.doctor_id = d.id
      WHERE w.user_id = ${session.userId}
      AND w.status IN ('waiting', 'notified')
      AND w.deleted_at IS NULL
      ORDER BY w.created_at DESC
    `

    return Response.json({ data: waitlist })
  } catch (error) {
    console.error('Waiting list error:', error)
    return Response.json({ error: 'Failed to fetch waiting list' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { appointment_id } = await req.json()

    const maxPos = await sql`
      SELECT COALESCE(MAX(queue_position), 0) + 1 as next_pos
      FROM appointment_waiting_list
      WHERE appointment_id = ${appointment_id} AND deleted_at IS NULL
    `

    const result = await sql`
      INSERT INTO appointment_waiting_list (appointment_id, user_id, queue_position, status)
      VALUES (${appointment_id}, ${session.userId}, ${maxPos[0].next_pos}, 'waiting')
      ON CONFLICT DO NOTHING
      RETURNING id, queue_position, status
    `

    if (!result[0]) {
      return Response.json({ error: 'Already in waiting list' }, { status: 400 })
    }

    return Response.json({ ok: true, queue_position: result[0].queue_position })
  } catch (error) {
    console.error('Join waiting list error:', error)
    return Response.json({ error: 'Failed to join waiting list' }, { status: 500 })
  }
}
