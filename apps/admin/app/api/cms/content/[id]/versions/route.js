import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { listVersions } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function GET(request, props) {
  const params = await props.params;
  const s = (await getSession());
  if (!s) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const versions = await listVersions(params.id);
  return NextResponse.json({ data: versions, meta: { count: versions.length }, errors: null });
}
