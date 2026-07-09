// GET /api/ambulance?district=&type=&q=  (returns ALL matches)
import { NextResponse } from 'next/server';
import { searchAmbulance } from '@/lib/ambulance';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const g = (k) => searchParams.get(k) || '';
  const providers = await searchAmbulance({ term: g('q'), districtId: g('district'), type: g('type') });
  return NextResponse.json({ data: providers, meta: { count: providers.length }, errors: null });
}
