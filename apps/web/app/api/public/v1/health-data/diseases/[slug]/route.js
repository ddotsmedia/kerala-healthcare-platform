// GET /api/public/v1/health-data/diseases/[slug] — published disease article. API key required.
import { NextResponse } from 'next/server';
import { withApiKey } from '@/lib/publicApi';
import { publicDisease } from '@/lib/publicData';

export const dynamic = 'force-dynamic';

export async function GET(request, ctx) {
  return withApiKey(request, 'health-data', async () => {
    const { slug } = await ctx.params;
    const row = await publicDisease(slug);
    if (!row) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
    return NextResponse.json({ data: row, meta: null, errors: null });
  });
}
