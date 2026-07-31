'use client';

// UtmCapture — persists paid-campaign attribution so it survives the booking
// flow even if a downstream link drops the query params. Writes a 30-day cookie
// `khp_utm` the first time a UTM/gclid param is seen. No network, no package.

import { useEffect } from 'react';

const KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid'];
const COOKIE = 'khp_utm';
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export default function UtmCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const found = {};
      for (const k of KEYS) {
        const v = params.get(k);
        if (v) found[k] = v.slice(0, 120);
      }
      if (Object.keys(found).length === 0) return;
      const value = encodeURIComponent(JSON.stringify(found));
      document.cookie = `${COOKIE}=${value}; path=/; max-age=${MAX_AGE}; samesite=lax`;
    } catch { /* private mode / blocked cookies — no-op */ }
  }, []);
  return null;
}
