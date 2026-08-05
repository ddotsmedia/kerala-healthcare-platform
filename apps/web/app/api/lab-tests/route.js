// GET /api/lab-tests?q=&category=&letter=&page= — paginated lab-test list/search.

import { NextResponse } from 'next/server';
import { listLabTests } from '@/lib/labTests';

export const dynamic = 'force-dynamic';
const LIMIT = 24;

export async function GET(request) {
  const u = new URL(request.url).searchParams;
  const page = Math.max(1, parseInt(u.get('page'), 10) || 1);
  const items = await listLabTests({
    q: u.get('q') || '', category: u.get('category') || '', letter: u.get('letter') || '',
    page, limit: LIMIT
  });
  return NextResponse.json({ data: items, meta: { page, count: items.length, hasNext: items.length === LIMIT }, errors: null });
}
