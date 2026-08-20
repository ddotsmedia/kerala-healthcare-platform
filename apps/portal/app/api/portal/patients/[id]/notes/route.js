// GET/POST /api/portal/patients/[id]/notes — clinical notes for one patient.

import { NextResponse } from 'next/server';
import { currentDoctorId } from '@/lib/profile';
import { listNotes, addNote } from '@/lib/patients';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const doctorId = await currentDoctorId();
  if (!doctorId) return NextResponse.json({ data: null, meta: null, errors: ['not_a_doctor'] }, { status: 403 });
  const { id } = await params;
  const data = await listNotes(doctorId, id);
  return NextResponse.json({ data, meta: { count: data.length }, errors: null });
}

export async function POST(request, { params }) {
  const doctorId = await currentDoctorId();
  if (!doctorId) return NextResponse.json({ data: null, meta: null, errors: ['not_a_doctor'] }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const res = await addNote(doctorId, id, {
    note: body.note, noteType: body.note_type, isPrivate: body.is_private, appointmentId: body.appointment_id
  });
  if (res.error) return NextResponse.json({ data: null, meta: null, errors: [res.error] }, { status: 400 });
  return NextResponse.json({ data: res, meta: null, errors: null }, { status: 201 });
}
