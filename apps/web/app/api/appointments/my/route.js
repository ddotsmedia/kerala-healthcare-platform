// GET /api/appointments/my — the patient's own appointments.

import { NextResponse } from 'next/server';
import { currentPatientId, listMyAppointments } from '@/lib/appointments';

export const dynamic = 'force-dynamic';

export async function GET() {
  const patientId = await currentPatientId();
  if (!patientId) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const items = await listMyAppointments(patientId);
  return NextResponse.json({ data: items, meta: { count: items.length }, errors: null });
}
