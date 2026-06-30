// GET /api/admin/verification/queue?status=pending
// Lists providers in the verification queue. Roles: platform_admin, verification_agent.

import { NextResponse } from 'next/server';
import { listQueue } from '@/lib/verification';
import { requireAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  if (!requireAdminRole(request)) {
    return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });
  }
  const status = new URL(request.url).searchParams.get('status') || 'pending';
  const items = await listQueue(status);
  return NextResponse.json({ data: items, meta: { status, count: items.length }, errors: null });
}
