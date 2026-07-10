// GET /api/mental-health-centres?district=&type=&service=&emergency=&q=&page=
import { NextResponse } from 'next/server';
import { searchMentalHealth } from '@/lib/mentalHealth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const g = (k) => searchParams.get(k) || '';
  const page = Math.max(1, parseInt(g('page'), 10) || 1);
  const centres = await searchMentalHealth({
    term: g('q'), districtId: g('district'), type: g('type'), service: g('service'),
    hasEmergency: g('emergency'), page, limit: 20
  });
  return NextResponse.json({ data: centres, meta: { page, count: centres.length }, errors: null });
}
