// GET /api/candidate/contact-requests — candidate's incoming contact requests.
import { NextResponse } from 'next/server';
import { listContactRequests } from '@/lib/recruiter';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rows = await listContactRequests();
  if (rows === null) return NextResponse.json({ data: null, meta: null, errors: ['not_a_candidate'] }, { status: 403 });
  return NextResponse.json({ data: rows, meta: { count: rows.length }, errors: null });
}
