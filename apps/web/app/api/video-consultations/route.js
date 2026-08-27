import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

function generateJitsiRoomId() {
  return `consultation-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export async function GET(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const consultations = await sql`
      SELECT
        vc.id,
        vc.appointment_id,
        vc.jitsi_room_id,
        vc.status,
        vc.started_at,
        vc.ended_at,
        a.scheduled_at,
        d.full_name as doctor_name,
        p.full_name as patient_name
      FROM video_consultations vc
      JOIN appointments a ON vc.appointment_id = a.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users p ON a.patient_id = p.id
      WHERE (d.id = ${session.userId} OR p.id = ${session.userId})
      AND vc.deleted_at IS NULL
      ORDER BY a.scheduled_at DESC
      LIMIT 20
    `

    return Response.json({ data: consultations })
  } catch (error) {
    console.error('Consultations error:', error)
    return Response.json({ error: 'Failed to fetch consultations' }, { status: 500 })
  }
}

export async function POST(req) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { appointment_id } = await req.json()

    const roomId = generateJitsiRoomId()

    const result = await sql`
      INSERT INTO video_consultations (appointment_id, jitsi_room_id, status, started_at)
      VALUES (${appointment_id}, ${roomId}, 'in_progress', NOW())
      ON CONFLICT DO NOTHING
      RETURNING id, jitsi_room_id, status
    `

    if (!result[0]) {
      const existing = await sql`
        SELECT id, jitsi_room_id, status FROM video_consultations
        WHERE appointment_id = ${appointment_id}
      `
      if (existing[0]) {
        return Response.json({
          ok: true,
          consultation: existing[0]
        })
      }
    }

    return Response.json({
      ok: true,
      consultation: result[0]
    })
  } catch (error) {
    console.error('Create consultation error:', error)
    return Response.json({ error: 'Failed to start consultation' }, { status: 500 })
  }
}
