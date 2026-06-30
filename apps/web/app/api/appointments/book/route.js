// POST /api/appointments/book { providerId, slotDate, slotStart, mode }
// Header X-Idempotency-Key makes a repeat return the original booking.

import { NextResponse } from 'next/server';
import { bookSlot } from '@khp/appointments';
import { currentPatientId } from '@/lib/appointments';
import { onAppointmentBooked } from '@/lib/appointmentNotify';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const patientId = await currentPatientId();
  if (!patientId) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  if (!body.providerId || !body.slotDate || !body.slotStart) {
    return NextResponse.json({ data: null, meta: null, errors: ['missing_fields'] }, { status: 400 });
  }
  const key = request.headers.get('x-idempotency-key') || null;
  const result = await bookSlot(body.providerId, patientId, body.slotDate, body.slotStart, body.mode, key);
  if (!result.ok) {
    const code = result.error === 'slot_taken' ? 409 : 400;
    return NextResponse.json({ data: null, meta: null, errors: [result.error] }, { status: code });
  }
  if (!result.replayed) await onAppointmentBooked(result.appointment.id);
  return NextResponse.json({ data: result.appointment, meta: { replayed: !!result.replayed }, errors: null }, { status: 201 });
}
