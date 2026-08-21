// GET /api/public/v1/doctors — verified doctors (public fields only). API key required.
import { NextResponse } from 'next/server';
import { withApiKey } from '@/lib/publicApi';
import { publicDoctors } from '@/lib/publicData';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return withApiKey(request, 'doctors', async () => {
    const { data, meta } = await publicDoctors(new URL(request.url).searchParams);
    return NextResponse.json({ data, meta, errors: null });
  });
}
