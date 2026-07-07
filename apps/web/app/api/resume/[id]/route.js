// PATCH /api/resume/[id] — update one or more resume sections (autosave target)
import { NextResponse } from 'next/server';
import { updateResumeSection } from '@/lib/resume';

export const dynamic = 'force-dynamic';

function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function PATCH(request, ctx) {
  const { id } = await ctx.params;
  let body;
  try { body = await request.json(); } catch { return err('invalid_json', 400); }
  const r = await updateResumeSection(id, body);
  if (r === null) return err('unauthenticated', 401);
  if (r === false) return err('not_found_or_no_change', 404);
  return NextResponse.json({ data: r, meta: null, errors: null });
}
