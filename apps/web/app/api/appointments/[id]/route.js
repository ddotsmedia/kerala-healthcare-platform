import { sql } from '@khp/db'
import { getSession } from '@/lib/auth'

export async function GET(req, { params }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params

    const appointment = await sql`
      SELECT
        a.id,
        a.scheduled_at,
        a.status,
        p.full_name as patient_name,
        d.full_name as doctor_name,
        d.id as doctor_id,
        vc.jitsi_room_id,
        vc.status as consultation_status
      FROM appointments a
      JOIN users p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      LEFT JOIN video_consultations vc ON a.id = vc.appointment_id
      WHERE a.id = ${id}
      AND (a.patient_id = ${session.userId} OR a.doctor_id = ${session.userId})
    `

    if (!appointment[0]) {
      return Response.json({ error: 'Appointment not found' }, { status: 404 })
    }

    const now = new Date()
    const appointmentTime = new Date(appointment[0].scheduled_at)
    const minutesBefore = Math.round((appointmentTime - now) / 60000)
    const canJoin = minutesBefore <= 15 && minutesBefore >= -60

    return Response.json({
      data: {
        ...appointment[0],
        can_join_video: canJoin,
        minutes_until_appointment: minutesBefore
      }
    })
  } catch (error) {
    console.error('Appointment fetch error:', error)
    return Response.json({ error: 'Failed to fetch appointment' }, { status: 500 })
  }
}
