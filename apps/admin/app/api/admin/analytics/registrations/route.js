// GET /api/admin/analytics/registrations?days= — daily registration trend.

import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { getRegistrationTrend } from '@/lib/platformAnalytics';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!(await requireAdminRole())) return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });
  const days = new URL(request.url).searchParams.get('days') || 30;
  const data = await getRegistrationTrend(days);
  return NextResponse.json({ data, meta: { count: data.length }, errors: null });
}
