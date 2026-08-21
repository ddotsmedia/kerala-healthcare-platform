// GET /api/admin/analytics/overview — headline growth numbers.

import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { getOverview } from '@/lib/platformAnalytics';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdminRole())) return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });
  return NextResponse.json({ data: await getOverview(), meta: null, errors: null });
}
