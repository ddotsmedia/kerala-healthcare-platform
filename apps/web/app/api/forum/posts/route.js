// POST /api/forum/posts — create a post (auth; starts pending moderation).
import { NextResponse } from 'next/server';
import { createPost } from '@/lib/forum';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const b = await request.json().catch(() => ({}));
  const r = await createPost(b);
  if (!r.ok) {
    const code = r.error === 'unauthenticated' ? 401 : 400;
    return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: code });
  }
  return NextResponse.json({ data: { slug: r.slug, status: 'pending' }, meta: null, errors: null }, { status: 201 });
}
