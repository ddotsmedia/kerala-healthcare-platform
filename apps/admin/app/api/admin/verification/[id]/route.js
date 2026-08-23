// PATCH /api/admin/verification/[id] — move a provider through the pipeline.
// Body: { status, reason?, nmcMatch? }. status in pending|in_review|verified|rejected.
import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { getItem, recordDecision, STATUSES } from '@/lib/verification';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  if (!(await requireAdminRole())) return NextResponse.json({ errors: ['forbidden'] }, { status: 403 });
  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  if (!STATUSES.includes(body.status)) return NextResponse.json({ errors: ['bad_status'] }, { status: 400 });
  const item = await getItem(id);
  if (!item) return NextResponse.json({ errors: ['not_found'] }, { status: 404 });
  const session = await getSession();
  try {
    await recordDecision({
      id, providerType: item.provider_type, providerId: item.provider_id, status: body.status,
      nmcChecked: body.status === 'verified' ? true : !!item.nmc_checked,
      nmcMatch: body.status === 'verified' ? (body.nmcMatch !== false) : item.nmc_match,
      notes: body.reason || item.notes || null, verifiedBy: session ? session.userId : null
    });
    return NextResponse.json({ data: { id, status: body.status }, errors: null });
  } catch (err) {
    return NextResponse.json({ errors: [err.message] }, { status: 400 });
  }
}
