// GET  /api/portal/profile  — own profile
// PATCH /api/portal/profile  — partial update (own profile only)
// Auth: doctor id from session in Phase 2 (PORTAL_DEMO_DOCTOR_ID stand-in).

import { NextResponse } from 'next/server';
import { currentDoctorId, getMyProfile, updateProfile } from '@/lib/profile';

export const dynamic = 'force-dynamic';

function noAuth() {
  return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
}

export async function GET() {
  const id = (await currentDoctorId());
  if (!id) return noAuth();
  const profile = await getMyProfile(id);
  if (!profile) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: profile, meta: null, errors: null });
}

export async function PATCH(request) {
  const id = (await currentDoctorId());
  if (!id) return noAuth();
  const body = await request.json().catch(() => ({}));
  const result = await updateProfile(id, {
    about_ml: body.about_ml, about_en: body.about_en, photo_url: body.photo_url,
    years_experience: body.years_experience, consultation_fee: body.consultation_fee,
    languages: Array.isArray(body.languages) ? body.languages : undefined,
    name_en: body.name_en, name_ml: body.name_ml, registration_number: body.registration_number
  });
  return NextResponse.json({ data: { id, ...result }, meta: null, errors: null });
}
