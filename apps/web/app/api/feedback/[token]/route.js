// POST /api/feedback/[token] — validate token, create a pending review, mark done.
// Public: the token is the authorisation (no login required).
import { NextResponse } from 'next/server';
import { getByFeedbackToken, markFeedbackCompleted } from '@khp/appointments';
import { createReview } from '@/lib/reviews';

export const dynamic = 'force-dynamic';
function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function POST(request, ctx) {
  const { token } = await ctx.params;
  const appt = await getByFeedbackToken(token);
  if (!appt) return err('invalid_token', 404);
  if (appt.feedback_completed_at) return err('already_submitted', 409);

  const b = await request.json().catch(() => ({}));
  const rating = parseInt(b.rating, 10);
  if (!(rating >= 1 && rating <= 5)) return err('invalid_rating', 400);

  const title = b.went_well ? String(b.went_well).slice(0, 200) : null;
  const body = [b.went_well, b.improve ? `\n\n${b.improve}` : ''].filter(Boolean).join('') || null;

  await createReview({
    entityType: 'doctor', entityId: appt.provider_id, patientId: appt.patient_id,
    rating, title, body: body ? String(body).slice(0, 2000) : null,
    isAnonymous: b.anonymous === true, appointmentId: appt.id
  });
  await markFeedbackCompleted(token);

  return NextResponse.json({ data: { submitted: true }, meta: null, errors: null }, { status: 201 });
}
