// PATCH /api/reviews/[id]/reject { reason } — admin rejects a review

import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { rejectReview } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function PATCH(request, ctx) {
  if (!(await requireAdminRole())) {
    return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });
  }
  const s = await getSession();
  const { id } = await ctx.params;
  const b = await request.json().catch(() => ({}));
  const ok = await rejectReview(id, s.userId, b.reason ? String(b.reason).slice(0, 300) : null);
  if (!ok) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: { id, status: 'rejected' }, meta: null, errors: null });
}
