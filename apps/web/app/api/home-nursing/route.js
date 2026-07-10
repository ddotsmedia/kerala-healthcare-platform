// GET /api/home-nursing?district=&service=&gender=&qual=&q=&page=
import { NextResponse } from 'next/server';
import { searchHomeNursing } from '@/lib/homeNursing';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const g = (k) => searchParams.get(k) || '';
  const page = Math.max(1, parseInt(g('page'), 10) || 1);
  const agencies = await searchHomeNursing({
    term: g('q'), districtId: g('district'), service: g('service'),
    gender: g('gender'), qualification: g('qual'), page, limit: 20
  });
  return NextResponse.json({ data: agencies, meta: { page, count: agencies.length }, errors: null });
}
