// POST /api/analytics/event — public, no auth. Records a conversion event.

import { NextResponse } from 'next/server';
import { recordEvent } from '@/lib/analytics';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const b = await request.json().catch(() => ({}));
  recordEvent({
    eventType: b.event_type, entityType: b.entity_type, entityId: b.entity_id,
    sessionId: b.session_id, metadata: b.metadata
  });
  return new NextResponse(null, { status: 204 });
}
