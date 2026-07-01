import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { archive } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const s = getSession();
  if (!s) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const r = await archive(s, params.id);
  if (!r.ok) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: r.error === 'forbidden' ? 403 : 400 });
  return NextResponse.json({ data: r.item, meta: null, errors: null });
}
