// POST /api/portal/referrals — create a specialist referral.

import { NextResponse } from 'next/server';
import { currentDoctorId } from '@/lib/profile';
import { createReferral } from '@/lib/referrals';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const id = await currentDoctorId();
  if (!id) return NextResponse.json({ data: null, meta: null, errors: ['not_a_doctor'] }, { status: 403 });
  const b = await request.json().catch(() => ({}));
  const res = await createReferral(id, {
    referredToId: b.referred_to_doctor_id, patientId: b.patient_id, appointmentId: b.appointment_id,
    reason: b.reason, clinicalSummary: b.clinical_summary, urgency: b.urgency
  });
  if (res.error) return NextResponse.json({ data: null, meta: null, errors: [res.error] }, { status: 400 });
  return NextResponse.json({ data: res, meta: null, errors: null }, { status: 201 });
}
