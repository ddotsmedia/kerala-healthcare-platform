// POST /api/organ-donation/pledge — public awareness pledge. Rate-limited per IP.

import { NextResponse } from 'next/server';
import { rateLimit } from '@khp/ratelimit';
import { createPledge, pledgeCount } from '@/lib/organDonation';

export const dynamic = 'force-dynamic';

const STATUS = { name_required: 400, organs_required: 400, pledge_failed: 400 };

export async function POST(request) {
  const ip = (request.headers.get('x-forwarded-for') || '').split(',')[0] || 'unknown';
  if (!rateLimit(`organ-pledge:${ip}`, 5, 3600).allowed) {
    return NextResponse.json({ data: null, meta: null, errors: ['rate_limited'] }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  const r = await createPledge(body);
  if (r.error) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: STATUS[r.error] || 400 });
  const count = await pledgeCount();
  return NextResponse.json({ data: { id: r.id, count }, meta: null, errors: null }, { status: 201 });
}
