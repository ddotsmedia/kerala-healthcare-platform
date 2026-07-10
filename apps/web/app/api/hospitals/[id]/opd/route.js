// GET /api/hospitals/[id]/opd — OPD schedule for a hospital.
import { NextResponse } from 'next/server';
import { hospitalOpd } from '@/lib/opd';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { id } = await ctx.params;
  const schedule = await hospitalOpd(id);
  return NextResponse.json({ data: schedule, meta: { count: schedule.length }, errors: null });
}
