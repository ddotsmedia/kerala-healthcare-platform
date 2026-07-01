// PATCH /api/cms/content/:id — update a draft/in_review item.

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { updateDraft } from '@/lib/cms';

export const dynamic = 'force-dynamic';

export async function PATCH(request, { params }) {
  const s = getSession();
  if (!s) return NextResponse.json({ data: null, meta: null, errors: ['unauthenticated'] }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const r = await updateDraft(s, params.id, body);
  if (!r.ok) {
    const code = r.error === 'forbidden' ? 403 : r.error === 'not_editable' ? 409 : 400;
    return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: code });
  }
  return NextResponse.json({ data: r.item, meta: null, errors: null });
}
