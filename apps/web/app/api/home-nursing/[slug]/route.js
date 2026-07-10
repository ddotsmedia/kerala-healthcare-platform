// GET /api/home-nursing/[slug] — full home nursing agency profile.
import { NextResponse } from 'next/server';
import { getHomeNursingBySlug } from '@/lib/homeNursing';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const a = await getHomeNursingBySlug(slug);
  if (!a) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: a, meta: null, errors: null });
}
