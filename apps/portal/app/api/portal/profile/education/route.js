// POST /api/portal/profile/education — add an education entry (own profile).

import { NextResponse } from 'next/server';
import { currentDoctorId, addEducation } from '@/lib/profile';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const id = currentDoctorId();
  if (!id) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (!body.degree) {
    return NextResponse.json({ data: null, meta: null, errors: ['degree_required'] }, { status: 400 });
  }
  await addEducation(id, {
    degree: body.degree, institution_ml: body.institution_ml,
    institution_en: body.institution_en, year_completed: body.year_completed
  });
  return NextResponse.json({ data: { ok: true }, meta: null, errors: null }, { status: 201 });
}
