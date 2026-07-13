// GET  /api/patient/refill-requests — my refill requests
// POST /api/patient/refill-requests — create a refill request
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { listMyRefillRequests, createRefillRequest } from '@/lib/refills';

export const dynamic = 'force-dynamic';
function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function GET() {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const rows = await listMyRefillRequests(uid);
  return NextResponse.json({ data: rows, meta: { count: rows.length }, errors: null });
}

export async function POST(request) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const body = await request.json().catch(() => ({}));
  if (!body.doctor_id) return err('doctor_required', 400);
  const row = await createRefillRequest(uid, body);
  if (!row) return err('invalid_request', 400);
  return NextResponse.json({ data: row, meta: null, errors: null }, { status: 201 });
}
