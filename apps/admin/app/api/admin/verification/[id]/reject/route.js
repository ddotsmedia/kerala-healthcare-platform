// POST /api/admin/verification/:id/reject  { reason }
// Marks a provider rejected with a reason recorded in the audit notes.

import { NextResponse } from 'next/server';
import { getItem, recordDecision } from '@/lib/verification';
import { requireAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request, props) {
  const params = await props.params;
  const role = requireAdminRole(request);
  if (!role) return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });

  const item = await getItem(params.id);
  if (!item) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  if (!body.reason) {
    return NextResponse.json({ data: null, meta: null, errors: ['reason_required'] }, { status: 400 });
  }
  await recordDecision({
    id: item.id, providerType: item.provider_type, providerId: item.provider_id,
    status: 'rejected', nmcChecked: false, nmcMatch: null,
    notes: body.reason, verifiedBy: null
  });
  return NextResponse.json({ data: { id: item.id, status: 'rejected' }, meta: null, errors: null });
}
