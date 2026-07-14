// GET /api/qa/[slug] — a published question with its answers.
import { NextResponse } from 'next/server';
import { getQuestionBySlug } from '@/lib/qa';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const q = await getQuestionBySlug(slug);
  if (!q) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: q, meta: null, errors: null });
}
