// POST /api/second-opinion — create a second-opinion request
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { createRequest } from '@/lib/secondOpinion';

export const dynamic = 'force-dynamic';
function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function POST(request) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const body = await request.json().catch(() => ({}));
  if (!body.condition_description) return err('condition_required', 400);
  const row = await createRequest(uid, body);
  if (!row) return err('create_failed', 400);
  return NextResponse.json({ data: row, meta: null, errors: null }, { status: 201 });
}
