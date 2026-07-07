// PATCH /api/candidate/contact-requests/[id] — accept (reveal contact) or reject.
import { NextResponse } from 'next/server';
import { respondContactRequest } from '@/lib/recruiter';

export const dynamic = 'force-dynamic';

export async function PATCH(request, ctx) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  if (body.action !== 'accept' && body.action !== 'reject') {
    return NextResponse.json({ data: null, meta: null, errors: ['invalid_action'] }, { status: 400 });
  }
  const r = await respondContactRequest(id, body.action === 'accept');
  if (r === null) return NextResponse.json({ data: null, meta: null, errors: ['not_a_candidate'] }, { status: 403 });
  if (r === false) return NextResponse.json({ data: null, meta: null, errors: ['not_found_or_handled'] }, { status: 404 });
  return NextResponse.json({ data: { id: r.id, status: r.status }, meta: null, errors: null });
}
