// GET /api/portal/referrals/received — referrals sent to the logged-in doctor.

import { NextResponse } from 'next/server';
import { currentDoctorId } from '@/lib/profile';
import { listReceived } from '@/lib/referrals';

export const dynamic = 'force-dynamic';

export async function GET() {
  const id = await currentDoctorId();
  if (!id) return NextResponse.json({ data: null, meta: null, errors: ['not_a_doctor'] }, { status: 403 });
  const data = await listReceived(id);
  return NextResponse.json({ data, meta: { count: data.length }, errors: null });
}
