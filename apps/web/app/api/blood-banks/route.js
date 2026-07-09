// GET /api/blood-banks?district=&blood_type=&is_24hr=&q=  (returns ALL matches)
import { NextResponse } from 'next/server';
import { searchBloodBanks } from '@/lib/bloodBanks';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const g = (k) => searchParams.get(k) || '';
  const banks = await searchBloodBanks({
    term: g('q'), districtId: g('district'), bloodType: g('blood_type'), is24hr: g('is_24hr') || g('h24')
  });
  return NextResponse.json({ data: banks, meta: { count: banks.length }, errors: null });
}
