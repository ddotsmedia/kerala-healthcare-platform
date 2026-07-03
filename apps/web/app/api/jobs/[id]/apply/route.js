// POST /api/jobs/:id/apply { cover_letter } — candidate applies (one per job).

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { applyToJob } from '@/lib/applications';

export const dynamic = 'force-dynamic';

export async function POST(request, props) {
  const params = await props.params;
  if (!(await getSession())) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const r = await applyToJob(params.id, body.cover_letter);
  if (!r.ok) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: r.error === 'not_a_candidate' ? 403 : 400 });
  return NextResponse.json({ data: r.application, meta: { duplicate: !!r.duplicate }, errors: null }, { status: 201 });
}
