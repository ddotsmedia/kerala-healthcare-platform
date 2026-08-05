// GET /api/lab-tests/search?q= — autocomplete (test name or abbreviation).

import { NextResponse } from 'next/server';
import { searchLabTests } from '@/lib/labTests';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const q = new URL(request.url).searchParams.get('q') || '';
  const items = await searchLabTests({ term: q, limit: 8 });
  const suggestions = items.map((t) => ({
    slug: t.slug, name_en: t.name_en, name_ml: t.name_ml, abbreviation: t.abbreviation, category: t.category
  }));
  return NextResponse.json({ data: suggestions, meta: { count: suggestions.length, q }, errors: null });
}
