import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { submit } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function POST(request, props) {
  const params = await props.params;
  const s = (await getSession());
  if (!s) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const r = await submit(s, params.id);
  if (!r.ok) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: r.error === 'forbidden' ? 403 : 409 });
  return NextResponse.json({ data: r.item, meta: null, errors: null });
}
