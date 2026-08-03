// GET /api/medicines/[slug] — full medicine information.

import { NextResponse } from 'next/server';
import { getMedicineBySlug } from '@/lib/medicines';

export const dynamic = 'force-dynamic';

export async function GET(_request, props) {
  const { slug } = await props.params;
  const m = await getMedicineBySlug(slug);
  if (!m) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  return NextResponse.json({ data: m, meta: null, errors: null });
}
