// GET /api/admin/analytics/pages?days=&limit= — top pages.

import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { getTopPages } from '@/lib/platformAnalytics';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!(await requireAdminRole())) return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });
  const u = new URL(request.url).searchParams;
  const data = await getTopPages(u.get('days') || 30, u.get('limit') || 20);
  return NextResponse.json({ data, meta: { count: data.length }, errors: null });
}
