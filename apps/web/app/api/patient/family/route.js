// GET  /api/patient/family — my family members
// POST /api/patient/family — add a family member
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { listFamily, addFamilyMember } from '@/lib/family';

export const dynamic = 'force-dynamic';
function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function GET() {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const rows = await listFamily(uid);
  return NextResponse.json({ data: rows, meta: { count: rows.length }, errors: null });
}

export async function POST(request) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const body = await request.json().catch(() => ({}));
  if (!body.name_en) return err('name_required', 400);
  const row = await addFamilyMember(uid, body);
  if (!row) return err('create_failed', 400);
  return NextResponse.json({ data: row, meta: null, errors: null }, { status: 201 });
}
