// GET /api/jobs/:id/applications — employer views applications for own listing.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { listApplicationsForJob } from '@/lib/applications';

export const dynamic = 'force-dynamic';

export async function GET(request, props) {
  const params = await props.params;
  if (!(await getSession())) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const r = await listApplicationsForJob(params.id);
  if (!r.ok) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: r.error === 'forbidden' ? 403 : 400 });
  return NextResponse.json({ data: r.applications, meta: { count: r.applications.length }, errors: null });
}
