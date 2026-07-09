// GET /api/ambulance/[slug] — full ambulance provider profile.
import { NextResponse } from 'next/server';
import { getAmbulanceBySlug } from '@/lib/ambulance';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const a = await getAmbulanceBySlug(slug);
  if (!a) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: a, meta: null, errors: null });
}
