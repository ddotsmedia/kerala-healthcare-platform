// PATCH /api/blood-donors/availability — toggle donor availability (login required).
import { NextResponse } from 'next/server';
import { updateAvailability } from '@/lib/blood';

export const dynamic = 'force-dynamic';
const STATUS = { unauthenticated: 401, not_registered: 404 };

export async function PATCH(request) {
  let body = {};
  try { body = await request.json(); } catch { /* empty */ }
  const r = await updateAvailability(body.is_available === true);
  if (r.error) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: STATUS[r.error] || 400 });
  return NextResponse.json({ data: { is_available: r.is_available }, meta: null, errors: null });
}
