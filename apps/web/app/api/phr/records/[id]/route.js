// PATCH/DELETE /api/phr/records/[id] — own record only.
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { updateRecord, deleteRecord } from '@/lib/phr';

export const dynamic = 'force-dynamic';

export async function PATCH(request, ctx) {
  const uid = await currentPatientId();
  if (!uid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const { id } = await ctx.params;
  const ok = await updateRecord(id, uid, await request.json().catch(() => ({})));
  return NextResponse.json({ data: ok ? { id } : null, meta: null, errors: ok ? null : ['not_found'] }, { status: ok ? 200 : 404 });
}

export async function DELETE(request, ctx) {
  const uid = await currentPatientId();
  if (!uid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const { id } = await ctx.params;
  const ok = await deleteRecord(id, uid);
  return NextResponse.json({ data: ok ? { id, deleted: true } : null, meta: null, errors: ok ? null : ['not_found'] }, { status: ok ? 200 : 404 });
}
