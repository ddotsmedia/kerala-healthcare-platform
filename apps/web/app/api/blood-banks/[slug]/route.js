// GET /api/blood-banks/[slug] — full blood bank profile.
import { NextResponse } from 'next/server';
import { getBloodBankBySlug } from '@/lib/bloodBanks';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const b = await getBloodBankBySlug(slug);
  if (!b) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: b, meta: null, errors: null });
}
