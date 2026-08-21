// GET /api/public/v1/hospitals — published hospitals. API key required.
import { NextResponse } from 'next/server';
import { withApiKey } from '@/lib/publicApi';
import { publicHospitals } from '@/lib/publicData';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return withApiKey(request, 'hospitals', async () => {
    const { data, meta } = await publicHospitals(new URL(request.url).searchParams);
    return NextResponse.json({ data, meta, errors: null });
  });
}
