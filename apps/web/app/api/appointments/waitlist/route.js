import { sql } from '@khp/db';
import { getSession } from '@/lib/auth';
import { rateLimit } from '@khp/ratelimit';
import { sendNotification } from '@/lib/notifications';

export async function POST(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  await rateLimit(session.userId, 'waitlist', 5, 3600);

  const { doctorId, appointmentDate, consultationMode = 'in-person' } = await req.json();
  if (!doctorId || !appointmentDate) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const patientId = session.userId;

  try {
    // Check if slot available
    const availabilityResult = await sql`
      SELECT COUNT(*) as available_slots
      FROM availability_overrides
      WHERE doctor_id = ${doctorId}
        AND override_date = ${appointmentDate}
        AND consultation_mode = ${consultationMode}
        AND is_available = true
        AND deleted_at IS NULL
    `;

    const availableSlots = availabilityResult[0]?.available_slots || 0;
    const bookedResult = await sql`
      SELECT COUNT(*) as booked_count
      FROM appointments
      WHERE doctor_id = ${doctorId}
        AND DATE(slot_start_time) = ${appointmentDate}
        AND consultation_mode = ${consultationMode}
        AND status IN ('confirmed', 'completed')
        AND deleted_at IS NULL
    `;

    const bookedCount = bookedResult[0]?.booked_count || 0;

    // If slots available, don't add to waitlist
    if (availableSlots > bookedCount) {
      return Response.json(
        { error: 'Appointment slots available', slotsAvailable: true },
        { status: 400 }
      );
    }

    // Check if already in waitlist for this date
    const existing = await sql`
      SELECT id FROM appointment_waitlists
      WHERE doctor_id = ${doctorId}
        AND patient_id = ${patientId}
        AND appointment_date = ${appointmentDate}
        AND consultation_mode = ${consultationMode}
        AND status IN ('waiting', 'offered')
        AND deleted_at IS NULL
    `;

    if (existing.length > 0) {
      return Response.json(
        { error: 'Already in waitlist for this date', waitlistId: existing[0].id },
        { status: 409 }
      );
    }

    // Get next position
    const positionResult = await sql`
      SELECT COALESCE(MAX(position), 0) + 1 as next_position
      FROM appointment_waitlists
      WHERE doctor_id = ${doctorId}
        AND appointment_date = ${appointmentDate}
        AND consultation_mode = ${consultationMode}
        AND status = 'waiting'
        AND deleted_at IS NULL
    `;

    const nextPosition = positionResult[0]?.next_position || 1;

    // Add to waitlist
    const result = await sql`
      INSERT INTO appointment_waitlists
        (doctor_id, patient_id, appointment_date, consultation_mode, status, position)
      VALUES (${doctorId}, ${patientId}, ${appointmentDate}, ${consultationMode}, 'waiting', ${nextPosition})
      ON CONFLICT DO NOTHING
      RETURNING id
    `;

    if (!result.length) {
      return Response.json({ error: 'Failed to join waitlist' }, { status: 500 });
    }

    const waitlistId = result[0].id;

    // Estimate wait time (rough: 30 min per person)
    const estimatedMinutes = (nextPosition - 1) * 30;

    // Send confirmation to patient
    await sendNotification(patientId, {
      type: 'waitlist_joined',
      doctorId,
      appointmentDate,
      position: nextPosition,
      sms: true,
      email: true,
    });

    return Response.json({
      waitlistId,
      position: nextPosition,
      estimatedWaitTime: `${estimatedMinutes} minutes`,
    });
  } catch (error) {
    console.error('Waitlist POST error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(req) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const patientId = session.userId;

  try {
    const waitlists = await sql`
      SELECT
        w.id,
        w.doctor_id,
        w.appointment_date,
        w.consultation_mode,
        w.status,
        w.position,
        w.created_at,
        w.offered_at,
        d.full_name as doctor_name,
        d.slug as doctor_slug,
        s.name as specialty_name
      FROM appointment_waitlists w
      LEFT JOIN doctors d ON w.doctor_id = d.id
      LEFT JOIN specialties s ON d.primary_specialty_id = s.id
      WHERE w.patient_id = ${patientId}
        AND w.deleted_at IS NULL
        AND w.status IN ('waiting', 'offered')
      ORDER BY w.appointment_date ASC, w.position ASC
    `;

    return Response.json({ waitlists });
  } catch (error) {
    console.error('Waitlist GET error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
