// GET /api/admin/analytics/funnel?days= — conversion funnel steps.

import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { getConversionFunnel } from '@/lib/platformAnalytics';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!(await requireAdminRole())) return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });
  const days = new URL(request.url).searchParams.get('days') || 30;
  return NextResponse.json({ data: await getConversionFunnel(days), meta: null, errors: null });
}
