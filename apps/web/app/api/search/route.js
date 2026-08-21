// GET /api/search?q=&locale=&type= — unified smart search.

import { NextResponse } from 'next/server';
import { smartSearch } from '@/lib/smartSearch';
import { recordEvent, recordSearchLog } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const u = new URL(request.url).searchParams;
  const q = u.get('q') || '';
  const locale = u.get('locale') || 'ml';
  const type = u.get('type') || undefined;
  const results = await smartSearch(q, locale, type);
  if (q.trim()) {
    recordEvent({ eventType: 'search', metadata: { q: q.trim().slice(0, 120) } });
    recordSearchLog({ query: q, locale, resultCount: results.length, filters: type ? { type } : null, sessionId: u.get('sid') });
  }
  return NextResponse.json({ data: results, meta: { count: results.length, q }, errors: null });
}
