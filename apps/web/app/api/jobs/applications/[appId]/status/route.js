// PATCH /api/jobs/applications/:appId/status { status, notes } — employer only.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { updateApplicationStatus } from '@/lib/applications';

export const dynamic = 'force-dynamic';

export async function PATCH(request, props) {
  const params = await props.params;
  if (!(await getSession())) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const r = await updateApplicationStatus(params.appId, body.status, body.notes);
  if (!r.ok) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: r.error === 'not_an_employer' ? 403 : 400 });
  return NextResponse.json({ data: r.application, meta: null, errors: null });
}
