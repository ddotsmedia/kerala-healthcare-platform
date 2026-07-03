// PATCH /api/reviews/[id]/approve — admin approves a review (triggers rating recalc)

import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { approveReview } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function PATCH(request, ctx) {
  if (!(await requireAdminRole())) {
    return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });
  }
  const s = await getSession();
  const { id } = await ctx.params;
  const ok = await approveReview(id, s.userId);
  if (!ok) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: { id, status: 'approved' }, meta: null, errors: null });
}
