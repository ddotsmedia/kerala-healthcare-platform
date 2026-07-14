// GET /api/qa?specialty=&q=&page= — published questions
import { NextResponse } from 'next/server';
import { listPublishedQuestions } from '@/lib/qa';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
  const rows = await listPublishedQuestions({
    specialtyId: searchParams.get('specialty') || '', term: searchParams.get('q') || '', page, limit: 20
  });
  return NextResponse.json({ data: rows, meta: { page, count: rows.length }, errors: null });
}
