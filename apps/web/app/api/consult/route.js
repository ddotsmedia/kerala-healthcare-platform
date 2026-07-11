// POST /api/consult { appointmentId, action:'start'|'end' } — video lifecycle.
import { NextResponse } from 'next/server';
import { startConsult, endConsult } from '@/lib/consult';

export const dynamic = 'force-dynamic';
function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function POST(request) {
  const b = await request.json().catch(() => ({}));
  if (!b.appointmentId) return err('appointment_required', 400);
  const r = b.action === 'end' ? await endConsult(b.appointmentId) : await startConsult(b.appointmentId);
  if (!r.ok) return err(r.error === 'forbidden' ? 'forbidden' : 'failed', r.error === 'forbidden' ? 403 : 400);
  return NextResponse.json({ data: { ok: true }, meta: null, errors: null });
}
