// GET /api/pharmacies/[slug] — full pharmacy profile.
import { NextResponse } from 'next/server';
import { getPharmacyBySlug } from '@/lib/pharmacies';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const ph = await getPharmacyBySlug(slug);
  if (!ph) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: ph, meta: null, errors: null });
}
