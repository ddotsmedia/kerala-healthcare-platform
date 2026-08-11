// GET /api/procedures/search?q= — autocomplete by procedure name.

import { NextResponse } from 'next/server';
import { searchProcedures } from '@/lib/procedures';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const q = new URL(request.url).searchParams.get('q') || '';
  const items = await searchProcedures({ term: q, limit: 8 });
  const suggestions = items.map((p) => ({
    slug: p.slug, name_en: p.name_en, name_ml: p.name_ml, category: p.category
  }));
  return NextResponse.json({ data: suggestions, meta: { count: suggestions.length, q }, errors: null });
}
