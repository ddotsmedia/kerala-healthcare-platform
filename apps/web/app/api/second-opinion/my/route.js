// GET /api/second-opinion/my — the patient's second-opinion requests
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { listMyRequests } from '@/lib/secondOpinion';

export const dynamic = 'force-dynamic';

export async function GET() {
  const uid = await currentPatientId();
  if (!uid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const rows = await listMyRequests(uid);
  return NextResponse.json({ data: rows, meta: { count: rows.length }, errors: null });
}
