// GET /api/reviews?status=pending&page=1 — moderation list (admin only)

import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { listReviewsByStatus, reviewStatusCounts } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!(await requireAdminRole())) {
    return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });
  }
  const sp = new URL(request.url).searchParams;
  const status = sp.get('status') || 'pending';
  const page = parseInt(sp.get('page'), 10) || 1;
  const [reviews, counts] = await Promise.all([listReviewsByStatus(status, page), reviewStatusCounts()]);
  return NextResponse.json({ data: reviews, meta: { counts, status, page }, errors: null });
}
