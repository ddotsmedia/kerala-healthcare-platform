// PATCH /api/patient/medication-reminders/[id] — update / toggle
// DELETE /api/patient/medication-reminders/[id] — remove
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { updateReminder, deleteReminder } from '@/lib/medReminders';

export const dynamic = 'force-dynamic';
function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function PATCH(request, ctx) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const r = await updateReminder(uid, id, body);
  if (r === false) return err('not_found_or_no_change', 404);
  return NextResponse.json({ data: r, meta: null, errors: null });
}

export async function DELETE(request, ctx) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const { id } = await ctx.params;
  const r = await deleteReminder(uid, id);
  if (!r) return err('not_found', 404);
  return NextResponse.json({ data: { deleted: true }, meta: null, errors: null });
}
