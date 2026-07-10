// GET/POST /api/phr/records — patient's own records only.
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { listRecords, createRecord } from '@/lib/phr';
import { ownsFamilyMember } from '@/lib/family';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const uid = await currentPatientId();
  if (!uid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const sp = new URL(request.url).searchParams;
  return NextResponse.json({ data: await listRecords(uid, sp.get('type') || undefined, sp.get('member') || null), meta: null, errors: null });
}

export async function POST(request) {
  const uid = await currentPatientId();
  if (!uid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  if (body.family_member_id && !(await ownsFamilyMember(uid, body.family_member_id))) {
    return NextResponse.json({ data: null, meta: null, errors: ['invalid_member'] }, { status: 403 });
  }
  const id = await createRecord(uid, body);
  if (!id) return NextResponse.json({ data: null, meta: null, errors: ['invalid_record'] }, { status: 400 });
  return NextResponse.json({ data: { id }, meta: null, errors: null }, { status: 201 });
}
