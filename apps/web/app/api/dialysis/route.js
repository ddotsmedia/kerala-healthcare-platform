// GET /api/dialysis?district=&hd=&pd=&govt=&shift=&q=&page=
import { NextResponse } from 'next/server';
import { searchDialysis } from '@/lib/dialysis';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const g = (k) => searchParams.get(k) || '';
  const page = Math.max(1, parseInt(g('page'), 10) || 1);
  const centres = await searchDialysis({
    term: g('q'), districtId: g('district'), hasHd: g('hd'), hasPd: g('pd'),
    acceptsGovt: g('govt'), shift: g('shift'), page, limit: 20
  });
  return NextResponse.json({ data: centres, meta: { page, count: centres.length }, errors: null });
}
