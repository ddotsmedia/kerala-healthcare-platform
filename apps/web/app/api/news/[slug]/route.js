// GET /api/news/[slug] — single published news article.
import { NextResponse } from 'next/server';
import { getNewsBySlug } from '@/lib/news';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const item = await getNewsBySlug(slug);
  if (!item) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: item, meta: null, errors: null });
}
