// POST /api/forum/posts/[id]/reply — reply (auth; pending; doctor-flagged).
import { NextResponse } from 'next/server';
import { createReply } from '@/lib/forum';

export const dynamic = 'force-dynamic';

export async function POST(request, ctx) {
  const { id } = await ctx.params;
  const b = await request.json().catch(() => ({}));
  const r = await createReply(id, b);
  if (!r.ok) {
    const code = r.error === 'unauthenticated' ? 401 : 400;
    return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: code });
  }
  return NextResponse.json({ data: { id: r.id, status: 'pending' }, meta: null, errors: null }, { status: 201 });
}
