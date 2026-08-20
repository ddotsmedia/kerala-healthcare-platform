// GET /api/portal/patients/[id] — one patient's record for this doctor.

import { NextResponse } from 'next/server';
import { currentDoctorId } from '@/lib/profile';
import { getPatient } from '@/lib/patients';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const doctorId = await currentDoctorId();
  if (!doctorId) return NextResponse.json({ data: null, meta: null, errors: ['not_a_doctor'] }, { status: 403 });
  const { id } = await params;
  const data = await getPatient(doctorId, id);
  if (!data) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data, meta: null, errors: null });
}
