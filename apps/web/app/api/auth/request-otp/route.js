// POST /api/auth/request-otp { mobile } — generate + send an OTP.

import { NextResponse } from 'next/server';
import { requestOtp } from '@khp/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { mobile } = await request.json().catch(() => ({}));
  if (!mobile) return NextResponse.json({ data: null, meta: null, errors: ['mobile_required'] }, { status: 400 });
  const r = await requestOtp(mobile);
  return NextResponse.json({ data: { sent: r.ok, debugCode: r.debugCode }, meta: null, errors: null });
}
