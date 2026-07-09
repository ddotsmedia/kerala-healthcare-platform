// GET /api/dental/[slug] — full dental clinic profile.
import { NextResponse } from 'next/server';
import { getDentalBySlug } from '@/lib/dental';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const c = await getDentalBySlug(slug);
  if (!c) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: c, meta: null, errors: null });
}
