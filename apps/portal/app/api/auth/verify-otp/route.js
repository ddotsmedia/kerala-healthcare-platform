// POST /api/auth/verify-otp { mobile, code } — verify OTP, issue tokens.

import { NextResponse } from 'next/server';
import { verifyOtp, signAccess, issueRefresh } from '@khp/auth';
import { setAuthCookies } from '@/lib/authCookies';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { mobile, code } = await request.json().catch(() => ({}));
  const r = await verifyOtp(mobile, code);
  if (!r.ok) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: 401 });
  const access = signAccess({ sub: r.userId, role: r.role });
  const refresh = await issueRefresh(r.userId);
  const res = NextResponse.json({ data: { userId: r.userId, role: r.role }, meta: null, errors: null });
  return setAuthCookies(res, access, refresh);
}
