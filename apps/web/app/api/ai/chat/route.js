// POST /api/ai/chat { message, locale, sessionId }
// Rate limited: 20 messages per session per hour. Returns response + sources + disclaimer.

import { NextResponse } from 'next/server';
import { ask, interactionCount } from '@khp/ai-assistant';

export const dynamic = 'force-dynamic';
const HOURLY_LIMIT = 20;

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const message = body.message;
  const sessionId = body.sessionId || 'anon';
  if (!message) return NextResponse.json({ data: null, meta: null, errors: ['message_required'] }, { status: 400 });

  const used = await interactionCount(sessionId, 60);
  if (used >= HOURLY_LIMIT) {
    return NextResponse.json({ data: null, meta: null, errors: ['rate_limit_exceeded'] },
      { status: 429, headers: { 'Retry-After': '3600' } });
  }

  const r = await ask(message, body.locale || 'ml', sessionId);
  return NextResponse.json({ data: { response: r.response, sources: r.sources, disclaimer: r.disclaimer }, meta: { flags: r.flags }, errors: null });
}
