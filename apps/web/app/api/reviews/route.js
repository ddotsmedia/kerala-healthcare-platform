// GET  /api/reviews?entity_type=doctor&entity_id=[id]&page=1  — approved reviews + summary
// POST /api/reviews  — create a pending review (auth required, one per patient/entity)

import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import {
  listApprovedReviews, reviewSummary, createReview, notifyAdminsNewReview, isValidEntityType
} from '@/lib/reviews';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const sp = new URL(request.url).searchParams;
  const entityType = sp.get('entity_type');
  const entityId = sp.get('entity_id');
  const page = parseInt(sp.get('page'), 10) || 1;
  if (!isValidEntityType(entityType) || !entityId) {
    return NextResponse.json({ data: null, meta: null, errors: ['entity_type_and_entity_id_required'] }, { status: 400 });
  }
  const [reviews, summary] = await Promise.all([
    listApprovedReviews(entityType, entityId, page),
    reviewSummary(entityType, entityId)
  ]);
  return NextResponse.json(
    { data: reviews, meta: { summary, page }, errors: null },
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } }
  );
}

export async function POST(request) {
  const patientId = await currentPatientId();
  if (!patientId) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });

  const b = await request.json().catch(() => ({}));
  const rating = parseInt(b.rating, 10);
  if (!isValidEntityType(b.entity_type) || !b.entity_id) {
    return NextResponse.json({ data: null, meta: null, errors: ['invalid_entity'] }, { status: 400 });
  }
  if (!(rating >= 1 && rating <= 5)) {
    return NextResponse.json({ data: null, meta: null, errors: ['rating_1_to_5'] }, { status: 400 });
  }
  if (b.body && String(b.body).length > 500) {
    return NextResponse.json({ data: null, meta: null, errors: ['body_too_long'] }, { status: 400 });
  }
  const r = await createReview({
    entityType: b.entity_type, entityId: b.entity_id, patientId, rating,
    title: b.title ? String(b.title).slice(0, 100) : null,
    body: b.body ? String(b.body).slice(0, 500) : null,
    isAnonymous: !!b.is_anonymous, appointmentId: b.appointment_id || null
  });
  if (!r.ok) {
    if (r.error === 'already_reviewed') {
      return NextResponse.json({ data: null, meta: null, errors: [`You have already reviewed this ${b.entity_type}`] }, { status: 409 });
    }
    return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: 400 });
  }
  await notifyAdminsNewReview(b.entity_type);
  return NextResponse.json({ data: { id: r.id, status: 'pending' }, meta: null, errors: null }, { status: 201 });
}
