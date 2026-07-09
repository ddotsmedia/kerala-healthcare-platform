// GET /api/dental?district=&treatment=&implants=&ortho=&pediatric=&q=&page=
import { NextResponse } from 'next/server';
import { searchDental } from '@/lib/dental';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const g = (k) => searchParams.get(k) || '';
  const page = Math.max(1, parseInt(g('page'), 10) || 1);
  const clinics = await searchDental({
    term: g('q'), districtId: g('district'), treatment: g('treatment'),
    hasImplants: g('implants'), hasOrthodontics: g('ortho'), hasPediatric: g('pediatric'),
    page, limit: 20
  });
  return NextResponse.json({ data: clinics, meta: { page, count: clinics.length }, errors: null });
}
