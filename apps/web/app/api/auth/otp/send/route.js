// POST /api/auth/otp/send { mobile } OR { email, locale } — generate + send an OTP.
// Email is the primary channel (SMS gateway not yet configured); mobile still
// works and fails gracefully if OTP_SMS_API_KEY is empty.

import { NextResponse } from 'next/server';
import { requestOtp, requestEmailOtp } from '@khp/auth';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const { mobile, email, locale } = await request.json().catch(() => ({}));

  if (!mobile && !email) {
    return NextResponse.json({ data: null, meta: null, errors: ['mobile_or_email_required'] }, { status: 400 });
  }

  const r = email
    ? await requestEmailOtp(email, locale === 'en' ? 'en' : 'ml')
    : await requestOtp(mobile);

  if (!r.ok) {
    const status = r.error === 'rate_limited' ? 429 : 502;
    return NextResponse.json({ data: null, meta: null, errors: [r.error || 'send_failed'] }, { status });
  }

  return NextResponse.json({
    data: { sent: true, channel: r.channel, delivery: r.delivery, debugCode: r.debugCode },
    meta: null,
    errors: null
  });
}
