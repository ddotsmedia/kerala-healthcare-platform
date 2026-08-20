// GET /api/portal/hospital/appointments[?format=csv] — today's appointments for
// the logged-in hospital admin's hospital. hospital_admin scope via session.

import { NextResponse } from 'next/server';
import { currentHospitalId } from '@/lib/hospital';
import { todaysAppointments } from '@/lib/hospitalPortal';

export const dynamic = 'force-dynamic';

const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export async function GET(request) {
  const id = await currentHospitalId();
  if (!id) return NextResponse.json({ data: null, meta: null, errors: ['no_hospital'] }, { status: 403 });
  const u = new URL(request.url).searchParams;
  const appts = await todaysAppointments(id, { doctorId: u.get('doctor') || undefined });

  if (u.get('format') === 'csv') {
    const lines = ['time,doctor,patient,mode,status',
      ...appts.map((a) => [String(a.slot_start).slice(0, 5), a.doctor_name, a.patient_name, a.consultation_mode, a.status].map(esc).join(','))];
    return new Response(`${lines.join('\n')}\n`, {
      status: 200,
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="appointments-today.csv"' }
    });
  }
  return NextResponse.json({ data: appts, meta: { count: appts.length }, errors: null });
}
