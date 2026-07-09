// GET /api/eye-hospitals/[slug] — full eye centre profile.
import { NextResponse } from 'next/server';
import { getEyeCentreBySlug } from '@/lib/eyeCentres';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const e = await getEyeCentreBySlug(slug);
  if (!e) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: e, meta: null, errors: null });
}
