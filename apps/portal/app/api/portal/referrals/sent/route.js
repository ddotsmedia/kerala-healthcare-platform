// GET /api/portal/referrals/sent — referrals the logged-in doctor has sent.

import { NextResponse } from 'next/server';
import { currentDoctorId } from '@/lib/profile';
import { listSent } from '@/lib/referrals';

export const dynamic = 'force-dynamic';

export async function GET() {
  const id = await currentDoctorId();
  if (!id) return NextResponse.json({ data: null, meta: null, errors: ['not_a_doctor'] }, { status: 403 });
  const data = await listSent(id);
  return NextResponse.json({ data, meta: { count: data.length }, errors: null });
}
