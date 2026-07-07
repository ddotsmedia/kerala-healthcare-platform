// POST /api/employer/candidates/[id]/request-contact — employer requests contact.
import { NextResponse } from 'next/server';
import { requestContact } from '@/lib/recruiter';

export const dynamic = 'force-dynamic';

export async function POST(request, ctx) {
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));
  const res = await requestContact(id, body.message);
  if (!res.ok) {
    const status = res.error === 'not_an_employer' ? 403 : 404;
    return NextResponse.json({ data: null, meta: null, errors: [res.error] }, { status });
  }
  return NextResponse.json({ data: { requested: true, duplicate: !!res.duplicate }, meta: null, errors: null },
    { status: res.duplicate ? 200 : 201 });
}
