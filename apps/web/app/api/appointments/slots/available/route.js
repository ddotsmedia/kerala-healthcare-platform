// POST /api/appointments/slots/available  { providerId, date }

import { NextResponse } from 'next/server';
import { getAvailableSlots } from '@khp/appointments';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  if (!body.providerId || !body.date) {
    return NextResponse.json({ data: null, meta: null, errors: ['providerId_and_date_required'] }, { status: 400 });
  }
  const slots = await getAvailableSlots(body.providerId, body.date);
  return NextResponse.json({ data: slots, meta: { count: slots.length, date: body.date }, errors: null });
}
