// GET /api/pharmacies?district=&is_24hr=&has_delivery=&generic=&q=&open=&page=
import { NextResponse } from 'next/server';
import { searchPharmacies } from '@/lib/pharmacies';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const g = (k) => searchParams.get(k) || '';
  const page = Math.max(1, parseInt(g('page'), 10) || 1);
  const pharmacies = await searchPharmacies({
    term: g('q'), districtId: g('district'), is24hr: g('is_24hr') || g('h24'),
    hasDelivery: g('has_delivery') || g('delivery'), sellsGeneric: g('generic'),
    openNow: g('open'), page, limit: 20
  });
  return NextResponse.json({ data: pharmacies, meta: { page, count: pharmacies.length }, errors: null });
}
