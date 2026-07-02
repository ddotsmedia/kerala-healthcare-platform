// GET /api/search?q=&locale=&type= — unified smart search.

import { NextResponse } from 'next/server';
import { smartSearch } from '@/lib/smartSearch';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const u = new URL(request.url).searchParams;
  const q = u.get('q') || '';
  const results = await smartSearch(q, u.get('locale') || 'ml', u.get('type') || undefined);
  return NextResponse.json({ data: results, meta: { count: results.length, q }, errors: null });
}
