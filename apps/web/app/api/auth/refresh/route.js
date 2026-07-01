// POST /api/auth/refresh — rotate the refresh token, mint a new access token.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { rotateRefresh, signAccess, REFRESH_COOKIE } from '@khp/auth';
import { setAuthCookies, clearAuthCookies } from '@/lib/authCookies';

export const dynamic = 'force-dynamic';

export async function POST() {
  const token = cookies().get(REFRESH_COOKIE)?.value;
  const r = await rotateRefresh(token);
  if (!r.ok) {
    return clearAuthCookies(NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: 401 }));
  }
  const access = signAccess({ sub: r.userId, role: r.role });
  const res = NextResponse.json({ data: { userId: r.userId, role: r.role }, meta: null, errors: null });
  return setAuthCookies(res, access, r.token);
}
