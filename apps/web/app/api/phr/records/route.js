// GET/POST /api/phr/records — patient's own records only.
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { listRecords, createRecord } from '@/lib/phr';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const uid = await currentPatientId();
  if (!uid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const type = new URL(request.url).searchParams.get('type') || undefined;
  return NextResponse.json({ data: await listRecords(uid, type), meta: null, errors: null });
}

export async function POST(request) {
  const uid = await currentPatientId();
  if (!uid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const id = await createRecord(uid, await request.json().catch(() => ({})));
  if (!id) return NextResponse.json({ data: null, meta: null, errors: ['invalid_record'] }, { status: 400 });
  return NextResponse.json({ data: { id }, meta: null, errors: null }, { status: 201 });
}
