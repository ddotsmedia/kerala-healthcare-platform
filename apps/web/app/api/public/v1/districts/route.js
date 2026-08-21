// GET /api/public/v1/districts — district reference data (ml/en/ta/hi). API key required.
import { NextResponse } from 'next/server';
import { withApiKey } from '@/lib/publicApi';
import { publicDistricts } from '@/lib/publicData';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return withApiKey(request, 'districts', async () => {
    const { data, meta } = await publicDistricts();
    return NextResponse.json({ data, meta, errors: null });
  });
}
