// GET /api/physiotherapy/[slug] — full physio centre profile.
import { NextResponse } from 'next/server';
import { getPhysioBySlug } from '@/lib/physio';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const p = await getPhysioBySlug(slug);
  if (!p) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: p, meta: null, errors: null });
}
