// GET  /api/patient/medication-reminders — my reminders
// POST /api/patient/medication-reminders — add a reminder
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { listReminders, addReminder } from '@/lib/medReminders';

export const dynamic = 'force-dynamic';
function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function GET() {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const rows = await listReminders(uid);
  return NextResponse.json({ data: rows, meta: { count: rows.length }, errors: null });
}

export async function POST(request) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const body = await request.json().catch(() => ({}));
  const row = await addReminder(uid, body);
  if (!row) return err('invalid_reminder', 400);
  return NextResponse.json({ data: row, meta: null, errors: null }, { status: 201 });
}
