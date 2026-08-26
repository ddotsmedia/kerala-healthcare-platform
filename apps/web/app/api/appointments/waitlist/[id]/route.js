import { sql } from '@khp/db';
import { getSession } from '@/lib/auth';
import { sendNotification } from '@/lib/notifications';

export async function DELETE(req, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const patientId = session.userId;

  try {
    // Verify ownership
    const waitlist = await sql`
      SELECT id FROM appointment_waitlists
      WHERE id = ${id} AND patient_id = ${patientId}
    `;

    if (!waitlist.length) {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }

    // Soft delete
    await sql`
      UPDATE appointment_waitlists
      SET deleted_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

    return Response.json({ success: true });
  } catch (error) {
    console.error('Waitlist DELETE error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  const { accept } = await req.json();
  const patientId = session.userId;

  try {
    // Get waitlist entry
    const waitlist = await sql`
      SELECT * FROM appointment_waitlists
      WHERE id = ${id} AND patient_id = ${patientId} AND status = 'offered'
    `;

    if (!waitlist.length) {
      return Response.json({ error: 'Offer expired or not found' }, { status: 404 });
    }

    const entry = waitlist[0];

    if (!accept) {
      // Decline offer: mark as expired, move next in queue
      await sql`
        UPDATE appointment_waitlists
        SET status = 'expired', updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;

      // Trigger next notification
      await notifyNextInQueue(entry.doctor_id, entry.appointment_date, entry.consultation_mode);

      return Response.json({ success: true, status: 'offer_declined' });
    }

    // Accept offer: try to book appointment
    const slots = await sql`
      SELECT slot_start_time, slot_end_time
      FROM availability_overrides
      WHERE doctor_id = ${entry.doctor_id}
        AND override_date = ${entry.appointment_date}
        AND consultation_mode = ${entry.consultation_mode}
        AND is_available = true
        AND deleted_at IS NULL
      LIMIT 1
    `;

    if (!slots.length) {
      return Response.json({ error: 'No slots available' }, { status: 400 });
    }

    const slot = slots[0];

    // Book appointment (race condition: first wins)
    try {
      const appointment = await sql`
        INSERT INTO appointments
          (doctor_id, patient_id, slot_start_time, slot_end_time, consultation_mode, status)
        VALUES (
          ${entry.doctor_id},
          ${patientId},
          ${slot.slot_start_time},
          ${slot.slot_end_time},
          ${entry.consultation_mode},
          'confirmed'
        )
        RETURNING id
      `;

      // Mark waitlist as confirmed
      await sql`
        UPDATE appointment_waitlists
        SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
      `;

      // Notify patient of successful booking
      await sendNotification(patientId, {
        type: 'appointment_confirmed',
        appointmentId: appointment[0].id,
        doctorId: entry.doctor_id,
        slotStart: slot.slot_start_time,
        sms: true,
        email: true,
      });

      // Trigger next notification
      await notifyNextInQueue(entry.doctor_id, entry.appointment_date, entry.consultation_mode);

      return Response.json({
        success: true,
        appointmentId: appointment[0].id,
        status: 'confirmed',
      });
    } catch (bookError) {
      // Slot was taken by someone else
      return Response.json(
        { error: 'Slot already booked', slotsAvailable: false },
        { status: 409 }
      );
    }
  } catch (error) {
    console.error('Waitlist POST error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function notifyNextInQueue(doctorId, appointmentDate, consultationMode) {
  try {
    const nextPatient = await sql`
      SELECT id, patient_id FROM appointment_waitlists
      WHERE doctor_id = ${doctorId}
        AND appointment_date = ${appointmentDate}
        AND consultation_mode = ${consultationMode}
        AND status = 'waiting'
        AND deleted_at IS NULL
      ORDER BY position ASC
      LIMIT 1
    `;

    if (!nextPatient.length) return;

    const entry = nextPatient[0];

    // Mark as offered
    await sql`
      UPDATE appointment_waitlists
      SET status = 'offered', offered_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${entry.id}
    `;

    // Send notification
    await sendNotification(entry.patient_id, {
      type: 'slot_offered',
      waitlistId: entry.id,
      appointmentDate,
      sms: true,
      email: true,
      push: true,
    });
  } catch (error) {
    console.error('notifyNextInQueue error:', error);
  }
}
