// POST /api/blood-donors/register — register/update donor profile (login required).
import { NextResponse } from 'next/server';
import { registerDonor } from '@/lib/blood';

export const dynamic = 'force-dynamic';

const STATUS = { unauthenticated: 401, invalid_blood_group: 400, invalid_district: 400, register_failed: 400 };

export async function POST(request) {
  let body = {};
  try { body = await request.json(); } catch { /* empty */ }
  const r = await registerDonor(body);
  if (r.error) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: STATUS[r.error] || 400 });
  return NextResponse.json({ data: { id: r.id }, meta: null, errors: null }, { status: 201 });
}
