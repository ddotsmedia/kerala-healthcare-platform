// GET  /api/blood-requests?district=&blood_group=&page= — public active requests.
// POST /api/blood-requests — create a request + alert matching donors (login required).
import { NextResponse } from 'next/server';
import { listRequests, createRequest } from '@/lib/blood';

export const dynamic = 'force-dynamic';
const STATUS = { unauthenticated: 401, invalid_blood_group: 400, invalid_district: 400, invalid_phone: 400, request_failed: 400 };

export async function GET(request) {
  const p = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(p.get('page'), 10) || 1);
  const items = await listRequests({
    districtId: p.get('district') || '', bloodGroup: p.get('blood_group') || '', page, limit: 20
  });
  return NextResponse.json({ data: items, meta: { page, count: items.length }, errors: null });
}

export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch { /* empty */ }
  const r = await createRequest(body);
  if (r.error) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: STATUS[r.error] || 400 });
  return NextResponse.json({ data: { id: r.id, alerted: r.alerted }, meta: null, errors: null }, { status: 201 });
}
