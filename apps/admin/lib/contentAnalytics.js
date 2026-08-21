// contentAnalytics.js — P-G4 article analytics from conversion_events
// (article_read / article_share) joined to content_items. Cached 5 min.

import { getPool } from '@khp/db';
import { cached } from '@khp/cache';

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}
const clampDays = (d, def) => Math.max(1, Math.min(365, parseInt(d, 10) || def));

export function getTopArticles(days = 30, limit = 20) {
  const d = clampDays(days, 30);
  const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  return cached(`ca:top:${d}:${l}`, 300, async () => rows(
    `SELECT ce.content_id, ci.title_en, ci.slug, ci.category, ci.type,
            count(*) FILTER (WHERE ce.event_type='article_read')::int AS views,
            count(*) FILTER (WHERE ce.event_type='article_share')::int AS shares
       FROM conversion_events ce
       JOIN content_items ci ON ci.id = ce.content_id
      WHERE ce.content_id IS NOT NULL AND ce.created_at > now() - make_interval(days => $1)
      GROUP BY ce.content_id, ci.title_en, ci.slug, ci.category, ci.type
      HAVING count(*) FILTER (WHERE ce.event_type='article_read') > 0
      ORDER BY views DESC LIMIT $2`, [d, l]));
}

export function getArticlesByCategory(days = 30) {
  const d = clampDays(days, 30);
  return cached(`ca:cat:${d}`, 300, async () => rows(
    `SELECT coalesce(ci.category, ci.type, 'other') AS category,
            count(*) FILTER (WHERE ce.event_type='article_read')::int AS views,
            count(*) FILTER (WHERE ce.event_type='article_share')::int AS shares,
            count(DISTINCT ce.content_id)::int AS articles
       FROM conversion_events ce
       JOIN content_items ci ON ci.id = ce.content_id
      WHERE ce.created_at > now() - make_interval(days => $1)
      GROUP BY 1 ORDER BY views DESC`, [d]));
}

export function getShareRate(articleId) {
  return cached(`ca:share:${articleId}`, 300, async () => {
    const [r] = await rows(
      `SELECT count(*) FILTER (WHERE event_type='article_read')::int AS views,
              count(*) FILTER (WHERE event_type='article_share')::int AS shares
         FROM conversion_events WHERE content_id=$1`, [articleId]);
    const views = r ? r.views : 0;
    const shares = r ? r.shares : 0;
    return { views, shares, rate: views > 0 ? Math.round((shares / views) * 1000) / 10 : 0 };
  });
}

export function getZeroViewArticles(days = 30, limit = 30) {
  const d = clampDays(days, 30);
  return cached(`ca:zero:${d}`, 300, async () => rows(
    `SELECT ci.id, ci.title_en, ci.slug, ci.category, ci.type
       FROM content_items ci
      WHERE ci.status='published' AND ci.deleted_at IS NULL
        AND NOT EXISTS (SELECT 1 FROM conversion_events ce
                         WHERE ce.content_id=ci.id AND ce.event_type='article_read'
                           AND ce.created_at > now() - make_interval(days => $1))
      ORDER BY ci.published_at DESC NULLS LAST LIMIT $2`, [d, limit]));
}

/** Map of content_id -> all-time view count, for the CMS list. */
export async function getViewCounts(ids = []) {
  const list = (ids || []).filter((x) => /^[0-9a-f-]{36}$/i.test(String(x)));
  if (list.length === 0) return {};
  const r = await rows(
    `SELECT content_id, count(*)::int AS views FROM conversion_events
      WHERE event_type='article_read' AND content_id = ANY($1::uuid[]) GROUP BY content_id`, [list]);
  return Object.fromEntries(r.map((x) => [x.content_id, x.views]));
}
