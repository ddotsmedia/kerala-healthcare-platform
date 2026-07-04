// POST /api/auth/register { role, name, email, nmc_number?, org_name?, locale? }
// Creates the account (role) if new, then sends an email OTP to complete sign-in.
// Doctor/hospital accounts start pending verification (completed in the portal).

import { NextResponse } from 'next/server';
import { getPool } from '@khp/db';
import { hashEmail, requestEmailOtp } from '@khp/auth';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

const ROLE_MAP = { patient: 'patient', doctor: 'doctor', hospital: 'hospital_admin' };

export async function POST(request) {
  const b = await request.json().catch(() => ({}));
  const role = ROLE_MAP[b.role];
  const name = String(b.name || '').trim().slice(0, 120);
  const email = String(b.email || '').trim();
  if (!role || !name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ data: null, meta: null, errors: ['invalid_input'] }, { status: 400 });
  }
  try {
    const eh = hashEmail(email);
    await getPool().query(
      `INSERT INTO users (role, full_name, email_hash)
       SELECT $1, $2, $3 WHERE NOT EXISTS (SELECT 1 FROM users WHERE email_hash = $3)`,
      [role, name, eh]
    );
  } catch (err) {
    logger.error('register_user_failed', { error: err.message });
    return NextResponse.json({ data: null, meta: null, errors: ['register_failed'] }, { status: 500 });
  }
  const r = await requestEmailOtp(email, b.locale === 'en' ? 'en' : 'ml');
  if (!r.ok) return NextResponse.json({ data: null, meta: null, errors: ['otp_failed'] }, { status: 502 });
  return NextResponse.json({ data: { sent: true, role, debugCode: r.debugCode }, meta: null, errors: null }, { status: 201 });
}
