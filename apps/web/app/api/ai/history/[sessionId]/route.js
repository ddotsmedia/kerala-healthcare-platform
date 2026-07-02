// GET /api/ai/history/:sessionId — last 10 interactions for continuity.

import { NextResponse } from 'next/server';
import { recentInteractions } from '@khp/ai-assistant';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const items = await recentInteractions(params.sessionId, 10);
  return NextResponse.json({ data: items, meta: { count: items.length }, errors: null });
}
