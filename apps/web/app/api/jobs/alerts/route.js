// GET  /api/jobs/alerts — list my saved job alerts
// POST /api/jobs/alerts — create a job alert from saved search criteria
import { NextResponse } from 'next/server';
import { listMyAlerts, createAlert } from '@/lib/jobs';

export const dynamic = 'force-dynamic';

const FREQ = ['instant', 'daily', 'weekly'];
const FILTER_KEYS = ['specialty_id', 'district_id', 'job_type', 'role_category', 'salary_min', 'is_remote', 'is_urgent', 'term'];

function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

function cleanFilters(raw) {
  const out = {};
  if (raw && typeof raw === 'object') {
    for (const k of FILTER_KEYS) if (raw[k] != null && raw[k] !== '') out[k] = raw[k];
  }
  return out;
}

export async function GET() {
  const alerts = await listMyAlerts();
  if (alerts === null) return err('unauthenticated', 401);
  return NextResponse.json({ data: alerts, meta: { count: alerts.length }, errors: null });
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return err('invalid_json', 400); }
  const name = (body.name || '').toString().trim();
  if (!name) return err('name_required', 400);
  const frequency = FREQ.includes(body.frequency) ? body.frequency : 'daily';
  const alert = await createAlert(name.slice(0, 120), cleanFilters(body.filters), frequency);
  if (alert === null) return err('unauthenticated', 401);
  return NextResponse.json({ data: alert, meta: null, errors: null }, { status: 201 });
}
