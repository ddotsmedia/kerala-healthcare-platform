// authCookies.js — set/clear the auth cookies on a NextResponse.

import { ACCESS_COOKIE, REFRESH_COOKIE, ACCESS_TTL_SECONDS, REFRESH_TTL_DAYS } from '@khp/auth';

const base = {
  httpOnly: true,
  sameSite: 'lax',
  path: '/',
  secure: process.env.NODE_ENV === 'production'
};

export function setAuthCookies(res, access, refresh) {
  res.cookies.set(ACCESS_COOKIE, access, { ...base, maxAge: ACCESS_TTL_SECONDS });
  if (refresh) res.cookies.set(REFRESH_COOKIE, refresh, { ...base, maxAge: REFRESH_TTL_DAYS * 24 * 3600 });
  return res;
}

export function clearAuthCookies(res) {
  res.cookies.set(ACCESS_COOKIE, '', { ...base, maxAge: 0 });
  res.cookies.set(REFRESH_COOKIE, '', { ...base, maxAge: 0 });
  return res;
}
