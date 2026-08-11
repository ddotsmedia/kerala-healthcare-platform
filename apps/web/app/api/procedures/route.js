// GET /api/procedures?q=&category=&specialty=&anaesthesia=&stay=&page=

import { NextResponse } from 'next/server';
import { listProcedures } from '@/lib/procedures';

export const dynamic = 'force-dynamic';
const LIMIT = 24;

export async function GET(request) {
  const u = new URL(request.url).searchParams;
  const page = Math.max(1, parseInt(u.get('page'), 10) || 1);
  const items = await listProcedures({
    q: u.get('q') || '', category: u.get('category') || '', specialtyId: u.get('specialty') || '',
    anaesthesia: u.get('anaesthesia') || '', stay: u.get('stay') || '', page, limit: LIMIT
  });
  return NextResponse.json({ data: items, meta: { page, count: items.length, hasNext: items.length === LIMIT }, errors: null });
}
