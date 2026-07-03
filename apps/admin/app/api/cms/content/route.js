// GET  /api/cms/content?type=&status=  — list content
// POST /api/cms/content                 — create draft (content_editor+)

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { listContent, createDraft } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const s = (await getSession());
  if (!s) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const u = new URL(request.url).searchParams;
  const items = await listContent({ type: u.get('type') || undefined, status: u.get('status') || undefined });
  return NextResponse.json({ data: items, meta: { count: items.length }, errors: null });
}

export async function POST(request) {
  const s = (await getSession());
  if (!s) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const r = await createDraft(s, body);
  if (!r.ok) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: r.error === 'forbidden' ? 403 : 400 });
  return NextResponse.json({ data: r.item, meta: null, errors: null }, { status: 201 });
}
