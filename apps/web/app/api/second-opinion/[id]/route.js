// PATCH /api/second-opinion/[id] — patient cancels their request ({action:'cancel'})
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { cancelRequest } from '@/lib/secondOpinion';

export const dynamic = 'force-dynamic';
function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function PATCH(request, ctx) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  if (body.action !== 'cancel') return err('invalid_action', 400);
  const r = await cancelRequest(uid, id);
  if (!r) return err('not_found_or_not_cancellable', 404);
  return NextResponse.json({ data: { cancelled: true }, meta: null, errors: null });
}
