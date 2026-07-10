// GET /api/patient/lab-reports/trends?parameter=hba1c — history + trend.
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { getParameterHistory } from '@/lib/labTrends';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const uid = await currentPatientId();
  if (!uid) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const h = await getParameterHistory(uid, searchParams.get('parameter') || '');
  return NextResponse.json({ data: h.points, meta: { trend: h.trend, band: h.band, parameter: h.parameter }, errors: null });
}
