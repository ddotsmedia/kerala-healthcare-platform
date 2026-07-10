// GET /api/fertility/[slug] — full fertility centre profile.
import { NextResponse } from 'next/server';
import { getFertilityBySlug } from '@/lib/fertility';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const f = await getFertilityBySlug(slug);
  if (!f) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: f, meta: null, errors: null });
}
