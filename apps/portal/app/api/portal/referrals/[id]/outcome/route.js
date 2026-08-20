// PATCH /api/portal/referrals/[id]/outcome — specialist updates outcome/status.

import { NextResponse } from 'next/server';
import { currentDoctorId } from '@/lib/profile';
import { updateOutcome } from '@/lib/referrals';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const doctorId = await currentDoctorId();
  if (!doctorId) return NextResponse.json({ data: null, meta: null, errors: ['not_a_doctor'] }, { status: 403 });
  const { id } = await params;
  const b = await request.json().catch(() => ({}));
  const res = await updateOutcome(doctorId, id, { status: b.status, outcome: b.outcome });
  if (res.error) return NextResponse.json({ data: null, meta: null, errors: [res.error] }, { status: 404 });
  return NextResponse.json({ data: res, meta: null, errors: null });
}
