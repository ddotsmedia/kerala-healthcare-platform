// GET /api/mental-health-centres/[slug] — full centre profile.
import { NextResponse } from 'next/server';
import { getMentalHealthBySlug } from '@/lib/mentalHealth';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const m = await getMentalHealthBySlug(slug);
  if (!m) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: m, meta: null, errors: null });
}
