// POST /api/contact — validate + email the team. Honeypot + 3/hour/IP rate limit.
// Always returns success to the user (email failures are logged, not exposed).

import { NextResponse } from 'next/server';
import { rateLimit } from '@khp/ratelimit';
import { sendEmail } from '@khp/notifications';

export const dynamic = 'force-dynamic';

const CONTACT_TO = process.env.CONTACT_EMAIL || 'admin@malayalidoctor.com';
const SUBJECTS = ['General Enquiry', 'Doctor Registration', 'Hospital Partnership', 'Report a Problem', 'Media', 'Other'];

function clientIp(request) {
  const xff = request.headers.get('x-forwarded-for');
  return (xff ? xff.split(',')[0] : '') || request.headers.get('x-real-ip') || 'unknown';
}

export async function POST(request) {
  const b = await request.json().catch(() => ({}));

  // Honeypot: real users never fill this hidden field.
  if (b.company) return NextResponse.json({ data: { sent: true }, meta: null, errors: null });

  const name = String(b.name || '').trim();
  const email = String(b.email || '').trim();
  const subject = SUBJECTS.includes(b.subject) ? b.subject : 'General Enquiry';
  const message = String(b.message || '').trim();
  if (!name || !email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || message.length < 10) {
    return NextResponse.json({ data: null, meta: null, errors: ['invalid_input'] }, { status: 400 });
  }

  const rl = rateLimit(`contact:${clientIp(request)}`, 3, 3600);
  if (!rl.allowed) {
    return NextResponse.json({ data: null, meta: null, errors: ['rate_limited'] }, { status: 429 });
  }

  const html = `<h3>New contact — ${subject}</h3>
    <p><b>Name:</b> ${name}</p><p><b>Email:</b> ${email}</p>
    <p><b>Message:</b></p><p>${message.replace(/</g, '&lt;')}</p>`;
  try {
    const r = await sendEmail(CONTACT_TO, `[Contact] ${subject} — ${name}`, html, `${name} <${email}>\n\n${message}`);
    if (r.status === 'failed') console.error(`contact email failed: ${r.error}`);
  } catch (err) {
    console.error(`contact email threw: ${err.message}`);
  }
  return NextResponse.json({ data: { sent: true }, meta: null, errors: null }, { status: 201 });
}
