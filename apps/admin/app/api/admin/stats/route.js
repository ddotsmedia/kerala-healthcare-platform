// GET /api/admin/stats — live stat cards + activity feed (polling fallback for SSE).
import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { liveStats, recentEvents } from '@/lib/dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdminRole())) return NextResponse.json({ data: null, errors: ['forbidden'] }, { status: 403 });
  const [stats, feed] = await Promise.all([liveStats(), recentEvents(10)]);
  return NextResponse.json({ data: { stats, feed }, meta: null, errors: null }, { headers: { 'Cache-Control': 'no-store' } });
}
