// GET /api/public/v1/specialties — specialty reference data. API key required.
import { NextResponse } from 'next/server';
import { withApiKey } from '@/lib/publicApi';
import { publicSpecialties } from '@/lib/publicData';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return withApiKey(request, 'specialties', async () => {
    const { data, meta } = await publicSpecialties();
    return NextResponse.json({ data, meta, errors: null });
  });
}
