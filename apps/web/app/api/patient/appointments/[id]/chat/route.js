// GET  /api/patient/appointments/[id]/chat — thread (marks doctor msgs read)
// POST /api/patient/appointments/[id]/chat { message }
import { NextResponse } from 'next/server';
import { getPatientChat, sendPatientMessage } from '@/lib/chat';

export const dynamic = 'force-dynamic';
const STATUS = { unauthenticated: 401, not_found: 404, locked: 403, empty: 400 };
function err(msg) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status: STATUS[msg] || 400 }); }

export async function GET(request, ctx) {
  const { id } = await ctx.params;
  const r = await getPatientChat(id);
  if (r.error) return err(r.error);
  return NextResponse.json({ data: r.messages, meta: { uid: r.uid }, errors: null });
}

export async function POST(request, ctx) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const r = await sendPatientMessage(id, body.message);
  if (!r.ok) return err(r.error);
  return NextResponse.json({ data: r.message, meta: null, errors: null }, { status: 201 });
}
