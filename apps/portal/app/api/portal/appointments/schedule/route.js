// GET /api/portal/appointments/schedule?date=YYYY-MM-DD — doctor's schedule.

import { NextResponse } from 'next/server';
import { currentDoctorId } from '@/lib/profile';
import { getSchedule } from '@/lib/schedule';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const providerId = currentDoctorId();
  if (!providerId) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const date = new URL(request.url).searchParams.get('date') || undefined;
  const result = await getSchedule(providerId, date);
  return NextResponse.json({ data: result.appointments, meta: { date: result.date }, errors: null });
}
