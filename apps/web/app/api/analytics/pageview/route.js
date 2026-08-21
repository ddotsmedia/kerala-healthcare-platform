// POST /api/analytics/pageview — public, no auth. Records a single page view.

import { NextResponse } from 'next/server';
import { recordPageView } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const b = await request.json().catch(() => ({}));
  recordPageView({
    path: b.path, locale: b.locale, referrer: b.referrer,
    utm_source: b.utm_source, utm_medium: b.utm_medium, utm_campaign: b.utm_campaign,
    sessionId: b.session_id
  });
  return new NextResponse(null, { status: 204 });
}
