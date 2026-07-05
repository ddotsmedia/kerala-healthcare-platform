// PATCH/DELETE /api/phr/medications/[id] — own medication only.
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { updateMedication, deleteMedication } from '@/lib/phr';

export const dynamic = 'force-dynamic';

export async function PATCH(request, ctx) {
  const uid = await currentPatientId();
  if (!uid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const { id } = await ctx.params;
  const ok = await updateMedication(id, uid, await request.json().catch(() => ({})));
  return NextResponse.json({ data: ok ? { id } : null, meta: null, errors: ok ? null : ['not_found'] }, { status: ok ? 200 : 404 });
}

export async function DELETE(request, ctx) {
  const uid = await currentPatientId();
  if (!uid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const { id } = await ctx.params;
  const ok = await deleteMedication(id, uid);
  return NextResponse.json({ data: ok ? { id, deleted: true } : null, meta: null, errors: ok ? null : ['not_found'] }, { status: ok ? 200 : 404 });
}
