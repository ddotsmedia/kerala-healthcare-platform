// PATCH /api/appointments/:id/cancel { reason } — patient cancels (>2h before).

import { NextResponse } from 'next/server';
import { currentPatientId, cancelByPatient } from '@/lib/appointments';
import { onAppointmentCancelled } from '@/lib/appointmentNotify';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const patientId = await currentPatientId();
  if (!patientId) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const result = await cancelByPatient(patientId, params.id, body.reason);
  if (!result.ok) {
    const code = result.error === 'too_late' ? 422 : result.error === 'not_found' ? 404 : 400;
    return NextResponse.json({ data: null, meta: null, errors: [result.error] }, { status: code });
  }
  await onAppointmentCancelled(params.id, 'patient');
  return NextResponse.json({ data: result.appointment, meta: null, errors: null });
}
