// GET /api/physiotherapy?district=&spec=&home=&q=&page=
import { NextResponse } from 'next/server';
import { searchPhysio } from '@/lib/physio';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const g = (k) => searchParams.get(k) || '';
  const page = Math.max(1, parseInt(g('page'), 10) || 1);
  const centres = await searchPhysio({
    term: g('q'), districtId: g('district'), specialisation: g('spec'),
    hasHomeVisit: g('home'), page, limit: 20
  });
  return NextResponse.json({ data: centres, meta: { page, count: centres.length }, errors: null });
}
