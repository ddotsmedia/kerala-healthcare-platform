// GET /:locale/events/:slug/ics — download an .ics calendar file for one event.

import { getEvent, eventToIcs } from '@/lib/events';
import { SITE } from '@/components/landing/LandingParts';

export const dynamic = 'force-dynamic';

export async function GET(_request, props) {
  const { locale, slug } = await props.params;
  const event = await getEvent(slug);
  if (!event) return new Response('Not found', { status: 404 });
  const ics = eventToIcs(event, `${SITE}/${locale}/events/${slug}`);
  return new Response(ics, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}.ics"`,
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
