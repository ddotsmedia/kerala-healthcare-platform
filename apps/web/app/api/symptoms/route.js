// GET /api/symptoms — full symptom list.

import { NextResponse } from 'next/server';
import { listSymptoms } from '@/lib/knowledge';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await listSymptoms();
  return NextResponse.json({ data: items, meta: { count: items.length }, errors: null });
}
