// GET  /api/patient/goals — my goals; POST — add a goal
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { listGoals, addGoal } from '@/lib/goals';

export const dynamic = 'force-dynamic';
function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function GET() {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const rows = await listGoals(uid);
  return NextResponse.json({ data: rows, meta: { count: rows.length }, errors: null });
}

export async function POST(request) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const body = await request.json().catch(() => ({}));
  const row = await addGoal(uid, body);
  if (!row) return err('invalid_goal', 400);
  return NextResponse.json({ data: row, meta: null, errors: null }, { status: 201 });
}
