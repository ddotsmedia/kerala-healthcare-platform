// GET /api/labs/[slug] — full lab profile (incl. tests).
import { NextResponse } from 'next/server';
import { getLabBySlug } from '@/lib/labs';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const lab = await getLabBySlug(slug);
  if (!lab) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: lab, meta: null, errors: null });
}
