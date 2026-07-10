// GET /api/medical-equipment?district=&type=&category=&rental=&q=&page=
import { NextResponse } from 'next/server';
import { searchEquipment } from '@/lib/equipment';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const g = (k) => searchParams.get(k) || '';
  const page = Math.max(1, parseInt(g('page'), 10) || 1);
  const suppliers = await searchEquipment({
    term: g('q'), districtId: g('district'), type: g('type'),
    category: g('category'), hasRental: g('rental'), page, limit: 20
  });
  return NextResponse.json({ data: suppliers, meta: { page, count: suppliers.length }, errors: null });
}
