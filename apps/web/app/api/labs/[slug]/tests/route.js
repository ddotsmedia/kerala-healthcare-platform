// GET /api/labs/[slug]/tests?category=&q= — a lab's tests, filterable.
import { NextResponse } from 'next/server';
import { getLabBySlug, listLabTests } from '@/lib/labs';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  const { slug } = await ctx.params;
  const lab = await getLabBySlug(slug);
  if (!lab) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  const { searchParams } = new URL(request.url);
  const tests = await listLabTests(lab.id, { category: searchParams.get('category') || '', q: searchParams.get('q') || '' });
  return NextResponse.json({ data: tests, meta: { count: tests.length }, errors: null });
}
