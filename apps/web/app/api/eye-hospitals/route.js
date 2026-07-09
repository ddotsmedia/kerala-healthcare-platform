// GET /api/eye-hospitals?district=&type=&surgery=&optical=&lowvision=&pediatric=&q=&page=
import { NextResponse } from 'next/server';
import { searchEyeCentres } from '@/lib/eyeCentres';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const g = (k) => searchParams.get(k) || '';
  const page = Math.max(1, parseInt(g('page'), 10) || 1);
  const centres = await searchEyeCentres({
    term: g('q'), districtId: g('district'), type: g('type'), surgery: g('surgery'),
    hasOptical: g('optical'), hasLowVision: g('lowvision'), hasPediatric: g('pediatric'),
    page, limit: 20
  });
  return NextResponse.json({ data: centres, meta: { page, count: centres.length }, errors: null });
}
