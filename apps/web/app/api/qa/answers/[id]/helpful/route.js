// POST /api/qa/answers/[id]/helpful — mark an answer helpful (+1).
import { NextResponse } from 'next/server';
import { voteHelpful } from '@/lib/qa';

export const dynamic = 'force-dynamic';

export async function POST(request, ctx) {
  const { id } = await ctx.params;
  const count = await voteHelpful(id);
  if (count == null) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: { helpful_count: count }, meta: null, errors: null });
}
