// PATCH /api/portal/appointments/:id/reschedule { newDate, newStart } — doctor only.

import { NextResponse } from 'next/server';
import { currentDoctorId } from '@/lib/profile';
import { rescheduleAppointment } from '@/lib/schedule';
import { notifyAppointmentEvent } from '@khp/notifications';

export const dynamic = 'force-dynamic';

export async function PATCH(request, props) {
  const params = await props.params;
  const providerId = (await currentDoctorId());
  if (!providerId) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!body.newDate || !body.newStart) {
    return NextResponse.json({ data: null, meta: null, errors: ['newDate_and_newStart_required'] }, { status: 400 });
  }
  const result = await rescheduleAppointment(providerId, params.id, body.newDate, body.newStart);
  if (!result.ok) {
    const code = result.error === 'slot_taken' ? 409 : 400;
    return NextResponse.json({ data: null, meta: null, errors: [result.error] }, { status: code });
  }
  try { await notifyAppointmentEvent('rescheduled', params.id); } catch (err) { console.error(err.message); }
  return NextResponse.json({ data: result.appointment, meta: null, errors: null });
}
