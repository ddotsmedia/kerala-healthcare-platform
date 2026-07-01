// GET /api/symptoms/:slug/doctors — nearby doctors for the top specialty.

import { NextResponse } from 'next/server';
import { symptomDoctors } from '@/lib/knowledge';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  const items = await symptomDoctors(params.slug);
  return NextResponse.json({ data: items, meta: { count: items.length }, errors: null });
}
