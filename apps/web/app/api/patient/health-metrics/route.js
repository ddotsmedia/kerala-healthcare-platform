// GET  /api/patient/health-metrics?type=&days=30 — readings + stats for a type
// POST /api/patient/health-metrics { metric_type, value, unit, notes, recorded_at }
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { addMetric, listMetrics, statsFor } from '@/lib/healthMetrics';

export const dynamic = 'force-dynamic';

function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function GET(request) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || '';
  const days = searchParams.get('days') || 30;
  const readings = await listMetrics(uid, type, days);
  return NextResponse.json({ data: readings, meta: statsFor(readings), errors: null });
}

export async function POST(request) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  let body;
  try { body = await request.json(); } catch { return err('invalid_json', 400); }
  const row = await addMetric(uid, body);
  if (!row) return err('invalid_input', 400);
  return NextResponse.json({ data: row, meta: null, errors: null }, { status: 201 });
}
