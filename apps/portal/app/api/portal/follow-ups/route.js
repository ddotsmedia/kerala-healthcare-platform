// GET/POST /api/portal/follow-ups — this doctor's follow-up reminders.

import { NextResponse } from 'next/server';
import { currentDoctorId } from '@/lib/profile';
import { listFollowUps, createFollowUp } from '@/lib/patients';

export const dynamic = 'force-dynamic';

export async function GET() {
  const id = await currentDoctorId();
  if (!id) return NextResponse.json({ data: null, meta: null, errors: ['not_a_doctor'] }, { status: 403 });
  const data = await listFollowUps(id, 7);
  return NextResponse.json({ data, meta: { count: data.length }, errors: null });
}

export async function POST(request) {
  const id = await currentDoctorId();
  if (!id) return NextResponse.json({ data: null, meta: null, errors: ['not_a_doctor'] }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const res = await createFollowUp(id, body.patient_id, { dueDate: body.due_date, reason: body.reason });
  if (res.error) return NextResponse.json({ data: null, meta: null, errors: [res.error] }, { status: 400 });
  return NextResponse.json({ data: res, meta: null, errors: null }, { status: 201 });
}
