// GET /api/medical-equipment/[slug] — full supplier profile.
import { NextResponse } from 'next/server';
import { getEquipmentBySlug } from '@/lib/equipment';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const e = await getEquipmentBySlug(slug);
  if (!e) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: e, meta: null, errors: null });
}
