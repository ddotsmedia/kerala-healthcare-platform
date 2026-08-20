// POST /api/register/doctor — doctor self-registration (public). Creates a
// pending, draft profile + verification-queue row. Best-effort admin/doctor email.

import { NextResponse } from 'next/server';
import { rateLimit } from '@khp/ratelimit';
import { registerDoctor } from '@/lib/doctorRegister';
import { sendEmail } from '@khp/notifications';

export const dynamic = 'force-dynamic';

const STATUS = { name_required: 400, invalid_registration: 400, terms_required: 400, duplicate: 409, register_failed: 500 };

export async function POST(request) {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown';
  if (!rateLimit(`doctor-register:${ip}`, 5, 3600).allowed) {
    return NextResponse.json({ data: null, meta: null, errors: ['rate_limited'] }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  const r = await registerDoctor(body, ip === 'unknown' ? null : ip);
  if (r.error) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: STATUS[r.error] || 400 });

  // Best-effort notifications (do not block the response on delivery).
  const email = String(body.email || '').trim();
  if (email && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    sendEmail(email, 'Your MalayaliDoctor profile is under review',
      'Thank you for registering. Your profile is under review — you will go live within 24-48 hours after verification.').catch(() => {});
  }
  return NextResponse.json({ data: { doctorId: r.doctorId, slug: r.slug, status: 'pending_verification' }, meta: null, errors: null }, { status: 201 });
}
