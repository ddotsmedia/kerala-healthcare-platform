'use client';

// Privacy-preserving page-view beacon. Fires on route change. Generates an
// anonymous per-tab session id (no personal data). Uses sendBeacon so it never
// blocks navigation.

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

function sessionId() {
  try {
    let s = sessionStorage.getItem('khp_sid');
    if (!s) {
      s = (crypto.randomUUID && crypto.randomUUID()) || String(Math.random()).slice(2);
      sessionStorage.setItem('khp_sid', s);
    }
    return s;
  } catch {
    return null;
  }
}

export default function PageViewTracker() {
  const pathname = usePathname();
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      const locale = (pathname.split('/')[1] || '').slice(0, 5);
      const payload = JSON.stringify({
        path: pathname,
        locale: locale === 'ml' || locale === 'en' ? locale : null,
        referrer: document.referrer || null,
        utm_source: url.searchParams.get('utm_source'),
        utm_medium: url.searchParams.get('utm_medium'),
        utm_campaign: url.searchParams.get('utm_campaign'),
        session_id: sessionId()
      });
      const blob = new Blob([payload], { type: 'application/json' });
      if (navigator.sendBeacon) navigator.sendBeacon('/api/analytics/pageview', blob);
      else fetch('/api/analytics/pageview', { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true });
    } catch { /* never block navigation */ }
  }, [pathname]);
  return null;
}

/** Fire a conversion event from the client (fire-and-forget). */
export function trackEvent(eventType, opts = {}) {
  try {
    const payload = JSON.stringify({
      event_type: eventType, entity_type: opts.entityType, entity_id: opts.entityId,
      session_id: sessionId(), metadata: opts.metadata
    });
    const blob = new Blob([payload], { type: 'application/json' });
    if (navigator.sendBeacon) navigator.sendBeacon('/api/analytics/event', blob);
  } catch { /* no-op */ }
}
