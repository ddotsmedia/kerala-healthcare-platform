// GET  /api/resume — my most recent resume (null data if none yet)
// POST /api/resume — create a resume { title, template_id }
import { NextResponse } from 'next/server';
import { getMyResume, createResume } from '@/lib/resume';

export const dynamic = 'force-dynamic';

function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function GET() {
  const r = await getMyResume();
  if (r === null) return err('unauthenticated', 401);
  return NextResponse.json({ data: r || null, meta: null, errors: null });
}

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return err('invalid_json', 400); }
  const r = await createResume(body.title, body.template_id);
  if (r === null) return err('unauthenticated', 401);
  return NextResponse.json({ data: r, meta: null, errors: null }, { status: 201 });
}
