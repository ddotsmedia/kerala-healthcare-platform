// PATCH /api/portal/appointments/:id/complete — doctor marks completed.

import { NextResponse } from 'next/server';
import { currentDoctorId } from '@/lib/profile';
import { completeAppointment } from '@/lib/schedule';

export const dynamic = 'force-dynamic';

export async function PATCH(request, props) {
  const params = await props.params;
  const providerId = (await currentDoctorId());
  if (!providerId) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const result = await completeAppointment(providerId, params.id);
  if (!result.ok) return NextResponse.json({ data: null, meta: null, errors: [result.error] }, { status: 400 });
  return NextResponse.json({ data: result.appointment, meta: null, errors: null });
}
