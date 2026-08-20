// GET /api/portal/patients[?q=] — the logged-in doctor's patient list.

import { NextResponse } from 'next/server';
import { currentDoctorId } from '@/lib/profile';
import { listPatients } from '@/lib/patients';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const id = await currentDoctorId();
  if (!id) return NextResponse.json({ data: null, meta: null, errors: ['not_a_doctor'] }, { status: 403 });
  const q = new URL(request.url).searchParams.get('q') || '';
  const data = await listPatients(id, q);
  return NextResponse.json({ data, meta: { count: data.length }, errors: null });
}
