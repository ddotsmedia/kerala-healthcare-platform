// PATCH /api/portal/appointments/:id/cancel { reason } — doctor cancels any time.

import { NextResponse } from 'next/server';
import { currentDoctorId } from '@/lib/profile';
import { cancelByDoctor } from '@/lib/schedule';
import { notifyAppointmentEvent } from '@khp/notifications';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const providerId = currentDoctorId();
  if (!providerId) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const result = await cancelByDoctor(providerId, params.id, body.reason);
  if (!result.ok) return NextResponse.json({ data: null, meta: null, errors: [result.error] }, { status: 400 });
  try { await notifyAppointmentEvent('cancelled', params.id, { byRole: 'doctor' }); } catch (err) { console.error(err.message); }
  return NextResponse.json({ data: result.appointment, meta: null, errors: null });
}
