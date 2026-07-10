// GET /api/palliative-care/[slug] — full palliative care centre profile.
import { NextResponse } from 'next/server';
import { getPalliativeBySlug } from '@/lib/palliative';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const p = await getPalliativeBySlug(slug);
  if (!p) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: p, meta: null, errors: null });
}
