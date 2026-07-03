// POST /api/jobs/applications/:appId/withdraw — candidate withdraws own.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { withdrawApplication } from '@/lib/applications';

export const dynamic = 'force-dynamic';

export async function POST(request, props) {
  const params = await props.params;
  if (!(await getSession())) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const r = await withdrawApplication(params.appId);
  if (!r.ok) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: 400 });
  return NextResponse.json({ data: r.application, meta: null, errors: null });
}
