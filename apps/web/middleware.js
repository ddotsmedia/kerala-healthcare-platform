// middleware.js — API rate limiting. Unauthenticated: 20 req/min per IP;
// authenticated (has session cookie): 100 req/min. Returns 429 + Retry-After.
// OTP and AI chat have their own tighter limits enforced in their handlers.

import { NextResponse } from 'next/server';
import { rateLimit } from '@khp/ratelimit';

export const config = { matcher: '/api/:path*' };

const UNAUTH_LIMIT = 20;
const AUTH_LIMIT = 100;
const WINDOW = 60;

export function middleware(request) {
  const authed = !!request.cookies.get('khp_access');
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    || request.headers.get('x-real-ip') || 'local';
  const key = authed ? `u:${request.cookies.get('khp_access').value.slice(-16)}` : `ip:${ip}`;
  const limit = authed ? AUTH_LIMIT : UNAUTH_LIMIT;

  const res = rateLimit(key, limit, WINDOW);
  if (!res.allowed) {
    return NextResponse.json(
      { data: null, meta: null, errors: ['rate_limit_exceeded'], retryAfter: res.retryAfter },
      { status: 429, headers: { 'Retry-After': String(res.retryAfter) } });
  }
  return NextResponse.next();
}
