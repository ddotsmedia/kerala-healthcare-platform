// POST /api/forum/report { kind: 'post'|'reply', id } — flag for moderation.
import { NextResponse } from 'next/server';
import { report } from '@/lib/forum';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const b = await request.json().catch(() => ({}));
  if (!b.id) return NextResponse.json({ data: null, meta: null, errors: ['id_required'] }, { status: 400 });
  await report(b.kind === 'reply' ? 'reply' : 'post', b.id);
  return NextResponse.json({ data: { reported: true }, meta: null, errors: null });
}
