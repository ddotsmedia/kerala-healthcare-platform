// GET /api/employer/candidates/[id] — full candidate profile WITHOUT contact
// (contact revealed only via accepted request). Increments profile_views.
import { NextResponse } from 'next/server';
import { getCandidateForEmployer } from '@/lib/recruiter';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { id } = await ctx.params;
  const c = await getCandidateForEmployer(id);
  if (c === null) return NextResponse.json({ data: null, meta: null, errors: ['not_an_employer'] }, { status: 403 });
  if (c === false) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: c, meta: null, errors: null });
}
