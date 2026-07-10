// PATCH  /api/patient/lab-reports/[id] — update metadata / results
// DELETE /api/patient/lab-reports/[id] — soft delete
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { updateLabReport, deleteLabReport } from '@/lib/labReports';

export const dynamic = 'force-dynamic';
function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function PATCH(request, ctx) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const r = await updateLabReport(uid, id, body);
  if (r === false) return err('not_found_or_no_change', 404);
  return NextResponse.json({ data: r, meta: null, errors: null });
}

export async function DELETE(request, ctx) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const { id } = await ctx.params;
  const r = await deleteLabReport(uid, id);
  if (!r) return err('not_found', 404);
  return NextResponse.json({ data: { deleted: true }, meta: null, errors: null });
}
