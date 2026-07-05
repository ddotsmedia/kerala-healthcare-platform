// POST /api/waitlist { email, topic, locale } — store interest. Idempotent.

import { NextResponse } from 'next/server';
import { getPool } from '@khp/db';
import { rateLimit } from '@khp/ratelimit';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const b = await request.json().catch(() => ({}));
  const email = String(b.email || '').trim();
  const topic = String(b.topic || 'general').trim().slice(0, 60);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ data: null, meta: null, errors: ['invalid_email'] }, { status: 400 });
  }
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown';
  if (!rateLimit(`waitlist:${ip}`, 10, 3600).allowed) {
    return NextResponse.json({ data: null, meta: null, errors: ['rate_limited'] }, { status: 429 });
  }
  try {
    await getPool().query(
      `INSERT INTO waitlist (email, topic, locale) VALUES ($1, $2, $3) ON CONFLICT (email, topic) DO NOTHING`,
      [email, topic, b.locale === 'en' ? 'en' : 'ml']
    );
  } catch { /* fail soft */ }
  return NextResponse.json({ data: { joined: true }, meta: null, errors: null }, { status: 201 });
}
