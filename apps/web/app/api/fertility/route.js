// GET /api/fertility?district=&treatment=&sperm=&egg=&q=&page=
import { NextResponse } from 'next/server';
import { searchFertility } from '@/lib/fertility';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const g = (k) => searchParams.get(k) || '';
  const page = Math.max(1, parseInt(g('page'), 10) || 1);
  const centres = await searchFertility({
    term: g('q'), districtId: g('district'), treatment: g('treatment'),
    hasSpermBank: g('sperm'), hasEggDonation: g('egg'), page, limit: 20
  });
  return NextResponse.json({ data: centres, meta: { page, count: centres.length }, errors: null });
}
