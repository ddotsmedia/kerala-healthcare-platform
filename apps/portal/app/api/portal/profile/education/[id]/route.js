// DELETE /api/portal/profile/education/:id — soft-remove an education entry.

import { NextResponse } from 'next/server';
import { currentDoctorId, deleteEducation } from '@/lib/profile';

export const dynamic = 'force-dynamic';

export async function DELETE(request, props) {
  const params = await props.params;
  const doctorId = (await currentDoctorId());
  if (!doctorId) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  await deleteEducation(doctorId, params.id);
  return NextResponse.json({ data: { ok: true }, meta: null, errors: null });
}
