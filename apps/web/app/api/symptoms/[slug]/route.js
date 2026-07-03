// GET /api/symptoms/:slug — symptom + mapped specialties + urgency.

import { NextResponse } from 'next/server';
import { getSymptom } from '@/lib/knowledge';

export const dynamic = 'force-dynamic';

export async function GET(request, props) {
  const params = await props.params;
  const s = await getSymptom(params.slug);
  if (!s) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: s, meta: null, errors: null });
}
