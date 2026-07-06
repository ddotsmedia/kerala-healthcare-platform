// PATCH  /api/jobs/alerts/[id] — update alert (name, filters, frequency, on/off)
// DELETE /api/jobs/alerts/[id] — soft-delete alert
import { NextResponse } from 'next/server';
import { updateAlert, deleteAlert } from '@/lib/jobs';

export const dynamic = 'force-dynamic';

const FREQ = ['instant', 'daily', 'weekly'];
const FILTER_KEYS = ['specialty_id', 'district_id', 'job_type', 'role_category', 'salary_min', 'is_remote', 'is_urgent', 'term'];

function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function PATCH(request, ctx) {
  const { id } = await ctx.params;
  let body;
  try { body = await request.json(); } catch { return err('invalid_json', 400); }
  const fields = {};
  if (typeof body.name === 'string' && body.name.trim()) fields.name = body.name.trim().slice(0, 120);
  if (body.frequency && FREQ.includes(body.frequency)) fields.frequency = body.frequency;
  if (typeof body.is_active === 'boolean') fields.is_active = body.is_active;
  if (body.filters && typeof body.filters === 'object') {
    const f = {};
    for (const k of FILTER_KEYS) if (body.filters[k] != null && body.filters[k] !== '') f[k] = body.filters[k];
    fields.filters = f;
  }
  if (!Object.keys(fields).length) return err('no_fields', 400);
  const alert = await updateAlert(id, fields);
  if (alert === null) return err('not_found', 404);
  return NextResponse.json({ data: alert, meta: null, errors: null });
}

export async function DELETE(request, ctx) {
  const { id } = await ctx.params;
  const gone = await deleteAlert(id);
  if (gone === null) return err('not_found', 404);
  return NextResponse.json({ data: { deleted: true }, meta: null, errors: null });
}
