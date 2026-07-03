// PATCH  /api/reviews/[id]  — edit own pending review (no entity change)
// DELETE /api/reviews/[id]  — soft-delete own review (triggers rating recalc)

import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { updateOwnReview, deleteOwnReview } from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function PATCH(request, ctx) {
  const patientId = await currentPatientId();
  if (!patientId) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const { id } = await ctx.params;
  const b = await request.json().catch(() => ({}));
  const rating = b.rating != null ? parseInt(b.rating, 10) : null;
  if (rating != null && !(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ data: null, meta: null, errors: ['rating_1_to_5'] }, { status: 400 });
  }
  const ok = await updateOwnReview(id, patientId, {
    rating,
    title: b.title != null ? String(b.title).slice(0, 100) : null,
    body: b.body != null ? String(b.body).slice(0, 500) : null,
    isAnonymous: b.is_anonymous
  });
  if (!ok) return NextResponse.json({ data: null, meta: null, errors: ['not_editable'] }, { status: 404 });
  return NextResponse.json({ data: { id, updated: true }, meta: null, errors: null });
}

export async function DELETE(request, ctx) {
  const patientId = await currentPatientId();
  if (!patientId) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const { id } = await ctx.params;
  const ok = await deleteOwnReview(id, patientId);
  if (!ok) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: { id, deleted: true }, meta: null, errors: null });
}
