// POST /api/admin/verification/:id/approve
// Marks a provider verified. Body (optional): { nmcChecked, nmcMatch }.

import { NextResponse } from 'next/server';
import { getItem, recordDecision } from '@/lib/verification';
import { requireAdminRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request, { params }) {
  const role = requireAdminRole(request);
  if (!role) return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });

  const item = await getItem(params.id);
  if (!item) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });

  const body = await request.json().catch(() => ({}));
  await recordDecision({
    id: item.id, providerType: item.provider_type, providerId: item.provider_id,
    status: 'verified',
    nmcChecked: body.nmcChecked != null ? !!body.nmcChecked : true,
    nmcMatch: body.nmcMatch != null ? !!body.nmcMatch : true,
    notes: body.notes || null, verifiedBy: null
  });
  return NextResponse.json({ data: { id: item.id, status: 'verified' }, meta: null, errors: null });
}
