// GET /api/news?category=&district=&page=&q= — public health-news feed.
import { NextResponse } from 'next/server';
import { listNews } from '@/lib/news';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const p = request.nextUrl.searchParams;
  const page = Math.max(1, parseInt(p.get('page'), 10) || 1);
  const items = await listNews({
    category: p.get('category') || '', districtId: p.get('district') || '',
    term: p.get('q') || '', page, limit: 20
  });
  return NextResponse.json({ data: items, meta: { page, count: items.length }, errors: null });
}
