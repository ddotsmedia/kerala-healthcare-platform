// GET /api/providers/[id]/opd — OPD schedule for a doctor (across hospitals).
import { NextResponse } from 'next/server';
import { providerOpd } from '@/lib/opd';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { id } = await ctx.params;
  const schedule = await providerOpd(id);
  return NextResponse.json({ data: schedule, meta: { count: schedule.length }, errors: null });
}
