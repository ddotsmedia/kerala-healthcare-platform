// analytics.js — privacy-preserving write path for page views and conversion
// events. No personal data: only path/locale/referrer/utm/session_id. All writes
// are fire-and-forget and never throw into the request path.

import { getPool } from '@khp/db';

const EVENT_TYPES = new Set([
  'search', 'profile_view', 'booking_started', 'booking_completed',
  'registration', 'login', 'job_applied', 'article_read', 'article_share'
]);

const asUuid = (v) => (/^[0-9a-f-]{36}$/i.test(String(v || '')) ? v : null);

const clip = (v, n) => (v == null ? null : String(v).slice(0, n));

/** @param {{path,locale,referrer,utm_source,utm_medium,utm_campaign,sessionId}} p */
export function recordPageView(p = {}) {
  const path = clip(p.path, 2048);
  if (!path) return;
  getPool().query(
    `INSERT INTO page_views (path, locale, referrer, utm_source, utm_medium, utm_campaign, session_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [path, clip(p.locale, 5), clip(p.referrer, 2048), clip(p.utm_source, 255),
      clip(p.utm_medium, 255), clip(p.utm_campaign, 255), clip(p.sessionId, 64)]
  ).catch((err) => console.error(`recordPageView failed: ${err.message}`));
}

/** Log a search query + result count for analytics. Fire-and-forget.
 * @param {{query,locale,resultCount,filters,sessionId}} p */
export function recordSearchLog(p = {}) {
  const query = clip(p.query, 500);
  if (!query || !query.trim()) return;
  getPool().query(
    `INSERT INTO search_logs (query, locale, result_count, filters, session_id)
     VALUES ($1,$2,$3,$4::jsonb,$5)`,
    [query.trim(), clip(p.locale, 5), Number.isFinite(p.resultCount) ? p.resultCount : 0,
      p.filters && Object.keys(p.filters).length ? JSON.stringify(p.filters) : null, clip(p.sessionId, 64)]
  ).catch((err) => console.error(`recordSearchLog failed: ${err.message}`));
}

/** @param {{eventType,entityType,entityId,contentId,sessionId,metadata}} p */
export function recordEvent(p = {}) {
  if (!EVENT_TYPES.has(p.eventType)) return;
  getPool().query(
    `INSERT INTO conversion_events (event_type, entity_type, entity_id, content_id, session_id, metadata)
     VALUES ($1,$2,$3,$4,$5,$6::jsonb)`,
    [p.eventType, clip(p.entityType, 50), asUuid(p.entityId), asUuid(p.contentId), clip(p.sessionId, 64),
      p.metadata ? JSON.stringify(p.metadata) : null]
  ).catch((err) => console.error(`recordEvent failed: ${err.message}`));
}
