// GET /api/labs?district=&nabl=&home_collection=&category=&q=&open=&page=
import { NextResponse } from 'next/server';
import { searchLabs } from '@/lib/labs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const g = (k) => searchParams.get(k) || '';
  const page = Math.max(1, parseInt(g('page'), 10) || 1);
  const labs = await searchLabs({
    term: g('q'), districtId: g('district'), nabl: g('nabl'),
    homeCollection: g('home_collection') || g('home'), testCategory: g('category'),
    openNow: g('open'), page, limit: 20
  });
  return NextResponse.json({ data: labs, meta: { page, count: labs.length }, errors: null });
}
