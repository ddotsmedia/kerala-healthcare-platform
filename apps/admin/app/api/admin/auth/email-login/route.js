// POST /api/admin/auth/email-login { email, password } — admin email+password login.
// Only platform_admin / verification_agent, is_verified. Same JWT session as OTP.
// Rate limit: 5 attempts per IP per 15 minutes.

import { NextResponse } from 'next/server';
import { getPool } from '@khp/db';
import { signAccess, issueRefresh, verifyPassword } from '@khp/auth';
import { rateLimit } from '@khp/ratelimit';
import { setAuthCookies } from '@/lib/authCookies';

export const dynamic = 'force-dynamic';

const WINDOW = 15 * 60; // seconds
const MAX_ATTEMPTS = 5;

function clientIp(request) {
  return (request.headers.get('x-forwarded-for') || '').split(',')[0].trim()
    || request.headers.get('x-real-ip') || 'local';
}

export async function POST(request) {
  const ip = clientIp(request);
  const rl = rateLimit(`adminlogin:${ip}`, MAX_ATTEMPTS, WINDOW);
  if (!rl.allowed) {
    return NextResponse.json({ data: null, meta: null, errors: ['too_many_attempts'], retryAfter: rl.retryAfter },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } });
  }

  const { email, password } = await request.json().catch(() => ({}));
  if (!email || !password) return NextResponse.json({ data: null, meta: null, errors: ['missing_credentials'] }, { status: 400 });

  const { rows } = await getPool().query(
    `SELECT id, role, email_plain, password_hash
       FROM users
      WHERE lower(email_plain) = lower($1)
        AND role IN ('platform_admin','verification_agent')
        AND is_verified = true AND deleted_at IS NULL
      LIMIT 1`,
    [String(email).trim()]
  );
  const user = rows[0];
  if (!user || !user.password_hash || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ data: null, meta: null, errors: ['invalid_credentials'] }, { status: 401 });
  }

  const token = signAccess({ sub: user.id, role: user.role });
  const refresh = await issueRefresh(user.id);
  const res = NextResponse.json({
    data: { token, user: { id: user.id, role: user.role, email: user.email_plain } }, meta: null, errors: null
  });
  return setAuthCookies(res, token, refresh);
}
