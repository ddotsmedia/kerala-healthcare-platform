import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function PATCH(req, { params }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const { status, ended_at, recording_url } = await req.json()

    const result = await sql`
      UPDATE video_consultations
      SET
        status = COALESCE(${status}, status),
        ended_at = COALESCE(${ended_at}, ended_at),
        recording_url = COALESCE(${recording_url}, recording_url),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, status, ended_at
    `

    if (!result[0]) {
      return Response.json({ error: 'Consultation not found' }, { status: 404 })
    }

    return Response.json({
      ok: true,
      consultation: result[0]
    })
  } catch (error) {
    console.error('Update consultation error:', error)
    return Response.json({ error: 'Failed to update consultation' }, { status: 500 })
  }
}

export async function GET(req, { params }) {
  try {
    const { id } = await params

    const consultation = await sql`
      SELECT
        vc.id,
        vc.jitsi_room_id,
        vc.status,
        vc.started_at,
        vc.ended_at,
        vc.recording_url,
        a.scheduled_at,
        d.full_name as doctor_name,
        p.full_name as patient_name
      FROM video_consultations vc
      JOIN appointments a ON vc.appointment_id = a.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users p ON a.patient_id = p.id
      WHERE vc.id = ${id} AND vc.deleted_at IS NULL
    `

    if (!consultation[0]) {
      return Response.json({ error: 'Consultation not found' }, { status: 404 })
    }

    return Response.json({ data: consultation[0] })
  } catch (error) {
    console.error('Consultation fetch error:', error)
    return Response.json({ error: 'Failed to fetch consultation' }, { status: 500 })
  }
}
