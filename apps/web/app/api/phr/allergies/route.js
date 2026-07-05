// GET/POST /api/phr/allergies — own allergies only.
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { listAllergies, addAllergy } from '@/lib/phr';

export const dynamic = 'force-dynamic';

export async function GET() {
  const uid = await currentPatientId();
  if (!uid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  return NextResponse.json({ data: await listAllergies(uid), meta: null, errors: null });
}

export async function POST(request) {
  const uid = await currentPatientId();
  if (!uid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const id = await addAllergy(uid, await request.json().catch(() => ({})));
  if (!id) return NextResponse.json({ data: null, meta: null, errors: ['invalid'] }, { status: 400 });
  return NextResponse.json({ data: { id }, meta: null, errors: null }, { status: 201 });
}
