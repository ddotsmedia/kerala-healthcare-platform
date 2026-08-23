// GET /api/admin/notifications — recent admin activity for the notification center.
import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { recentEvents } from '@/lib/dashboard';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await requireAdminRole())) return NextResponse.json({ data: null, errors: ['forbidden'] }, { status: 403 });
  const data = await recentEvents(20);
  return NextResponse.json({ data, meta: { count: data.length }, errors: null });
}
