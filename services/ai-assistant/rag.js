// rag.js — retrieve the top published knowledge articles for a query.

import { getPool } from '@khp/db';

const SITE = process.env.NEXT_PUBLIC_APP_URL || 'https://keralahealthportal.in';

/**
 * @param {string} query
 * @param {number} limit
 * @returns {Promise<Array<{id,slug,type,title,excerpt,url}>>}
 */
async function findRelevantContent(query, limit = 5) {
  if (!query) return [];
  try {
    const { rows } = await getPool().query(
      `SELECT id, slug, type, title_en, title_ml, excerpt_en, excerpt_ml,
              ts_rank(to_tsvector('simple', unaccent(coalesce(title_en,'') || ' ' ||
                 coalesce(title_ml,'') || ' ' || coalesce(body_en,'') || ' ' ||
                 coalesce(body_ml,''))), websearch_to_tsquery('simple', unaccent($1))) AS rank
         FROM content_items
        WHERE status = 'published' AND deleted_at IS NULL
          AND to_tsvector('simple', unaccent(coalesce(title_en,'') || ' ' ||
                 coalesce(title_ml,'') || ' ' || coalesce(body_en,'') || ' ' ||
                 coalesce(body_ml,''))) @@ websearch_to_tsquery('simple', unaccent($1))
        ORDER BY rank DESC LIMIT $2`,
      [query, limit]);
    return rows.map((r) => ({
      id: r.id, slug: r.slug, type: r.type,
      title: r.title_en || r.title_ml,
      excerpt: r.excerpt_en || r.excerpt_ml || '',
      url: `${SITE}/en/health/${r.slug}`
    }));
  } catch (err) {
    console.error(`rag findRelevantContent failed: ${err.message}`);
    return [];
  }
}

export { findRelevantContent };
