// POST /api/auth/logout — revoke refresh token, clear cookies.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { revokeRefresh, REFRESH_COOKIE } from '@khp/auth';
import { clearAuthCookies } from '@/lib/authCookies';

export const dynamic = 'force-dynamic';

export async function POST() {
  await revokeRefresh(cookies().get(REFRESH_COOKIE)?.value);
  return clearAuthCookies(NextResponse.json({ data: { ok: true }, meta: null, errors: null }));
}
