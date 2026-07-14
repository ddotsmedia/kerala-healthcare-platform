// news.js — public health-news reads. Only published, non-deleted rows. Fails soft.

import { getPool } from '@khp/db';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`news query failed: ${err.message}`); return []; }
}

const CATEGORIES = ['outbreak', 'advisory', 'policy', 'awareness', 'research'];

const COLS = `n.id, n.slug, n.title_ml, n.title_en, n.summary_ml, n.summary_en,
  n.source, n.source_url, n.category, n.importance, n.image_url, n.published_at,
  n.district_id, di.name_ml AS district_ml, di.name_en AS district_en`;

async function listNews({ category, districtId, term, page = 1, limit = 20 } = {}) {
  const where = ['n.is_published = true', 'n.deleted_at IS NULL'];
  const values = [];
  if (category && CATEGORIES.includes(category)) { values.push(category); where.push(`n.category = $${values.length}`); }
  if (districtId) { values.push(districtId); where.push(`n.district_id = $${values.length}`); }
  if (term) { values.push(`%${term}%`); where.push(`(n.title_ml ILIKE $${values.length} OR n.title_en ILIKE $${values.length} OR n.summary_ml ILIKE $${values.length})`); }
  const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;
  values.push(lim); const li = values.length;
  values.push(off); const oi = values.length;
  return run(`SELECT ${COLS} FROM health_news n
                LEFT JOIN districts di ON di.id = n.district_id
               WHERE ${where.join(' AND ')}
               ORDER BY n.published_at DESC LIMIT $${li} OFFSET $${oi}`, values);
}

/** Active breaking-news items (for the red banner). */
function breakingNews(limit = 3) {
  return run(`SELECT ${COLS} FROM health_news n
                LEFT JOIN districts di ON di.id = n.district_id
               WHERE n.is_published = true AND n.deleted_at IS NULL AND n.importance = 'breaking'
               ORDER BY n.published_at DESC LIMIT $1`, [limit]);
}

/** Latest N items (homepage strip). */
function latestNews(limit = 3) {
  return run(`SELECT ${COLS} FROM health_news n
                LEFT JOIN districts di ON di.id = n.district_id
               WHERE n.is_published = true AND n.deleted_at IS NULL
               ORDER BY n.published_at DESC LIMIT $1`, [limit]);
}

async function getNewsBySlug(slug) {
  const rows = await run(`SELECT ${COLS}, n.body_ml, n.body_en FROM health_news n
                            LEFT JOIN districts di ON di.id = n.district_id
                           WHERE n.slug = $1 AND n.is_published = true AND n.deleted_at IS NULL`, [slug]);
  return rows[0] || null;
}

function relatedNews(category, excludeId, limit = 4) {
  if (!category) return Promise.resolve([]);
  return run(`SELECT ${COLS} FROM health_news n
                LEFT JOIN districts di ON di.id = n.district_id
               WHERE n.is_published = true AND n.deleted_at IS NULL AND n.category = $1 AND n.id <> $2
               ORDER BY n.published_at DESC LIMIT $3`, [category, excludeId, limit]);
}

export { listNews, breakingNews, latestNews, getNewsBySlug, relatedNews, CATEGORIES };
