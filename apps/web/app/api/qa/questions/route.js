// POST /api/qa/questions — patient asks a question (pending moderation).
import { NextResponse } from 'next/server';
import { createQuestion } from '@/lib/qa';

export const dynamic = 'force-dynamic';
const STATUS = { unauthenticated: 401, invalid: 400, diagnosis_request: 422, create_failed: 400 };

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const r = await createQuestion(body);
  if (r.error) return NextResponse.json({ data: null, meta: null, errors: [r.error] }, { status: STATUS[r.error] || 400 });
  return NextResponse.json({ data: r.question, meta: null, errors: null }, { status: 201 });
}
