// GET /api/medicines/search?q= — autocomplete (generic or brand name).

import { NextResponse } from 'next/server';
import { searchMedicines } from '@/lib/medicines';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const q = new URL(request.url).searchParams.get('q') || '';
  const items = await searchMedicines({ term: q, limit: 8 });
  const suggestions = items.map((m) => ({
    slug: m.slug, generic_name_en: m.generic_name_en, generic_name_ml: m.generic_name_ml,
    drug_class: m.drug_class, is_otc: m.is_otc
  }));
  return NextResponse.json({ data: suggestions, meta: { count: suggestions.length, q }, errors: null });
}
