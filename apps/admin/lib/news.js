// news.js — admin health-news management. Parameterised SQL. Fails soft.

import { randomBytes } from 'node:crypto';
import { getPool } from '@khp/db';

const CATEGORIES = ['outbreak', 'advisory', 'policy', 'awareness', 'research'];
const IMPORTANCE = ['breaking', 'high', 'normal'];

async function run(text, values = []) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`admin news query failed: ${err.message}`); return []; }
}

function slugify(title) {
  const base = String(title || 'news').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 70) || 'news';
  return `${base}-${randomBytes(3).toString('hex')}`;
}

export function listDistricts() {
  return run(`SELECT id, name_en FROM districts WHERE deleted_at IS NULL ORDER BY name_en`);
}

export function listNews({ status } = {}) {
  const where = ['deleted_at IS NULL'];
  if (status === 'published') where.push('is_published = true');
  else if (status === 'draft') where.push('is_published = false');
  return run(
    `SELECT n.id, n.slug, n.title_ml, n.title_en, n.category, n.importance,
            n.is_published, n.published_at, di.name_en AS district_en
       FROM health_news n LEFT JOIN districts di ON di.id = n.district_id
      WHERE ${where.join(' AND ')} ORDER BY n.published_at DESC LIMIT 100`);
}

export async function createNews(b) {
  const titleMl = String(b.title_ml || '').trim();
  const summaryMl = String(b.summary_ml || '').trim();
  if (!titleMl || !summaryMl) return { ok: false, error: 'invalid' };
  const category = CATEGORIES.includes(b.category) ? b.category : 'awareness';
  const importance = IMPORTANCE.includes(b.importance) ? b.importance : 'normal';
  const rows = await run(
    `INSERT INTO health_news
       (slug, title_ml, title_en, summary_ml, summary_en, body_ml, body_en,
        source, source_url, category, district_id, importance, image_url, is_published)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     ON CONFLICT (slug) DO NOTHING RETURNING id`,
    [slugify(titleMl), titleMl, b.title_en || null, summaryMl, b.summary_en || null,
     b.body_ml || null, b.body_en || null, b.source || null, b.source_url || null,
     category, b.district_id || null, importance, b.image_url || null, b.is_published !== false]);
  return rows[0] ? { ok: true, id: rows[0].id } : { ok: false, error: 'create_failed' };
}

export async function updateNews(id, b) {
  const category = CATEGORIES.includes(b.category) ? b.category : null;
  const importance = IMPORTANCE.includes(b.importance) ? b.importance : null;
  const rows = await run(
    `UPDATE health_news SET
        title_ml = COALESCE($2, title_ml), title_en = $3,
        summary_ml = COALESCE($4, summary_ml), summary_en = $5,
        body_ml = $6, body_en = $7, source = $8, source_url = $9,
        category = COALESCE($10, category), district_id = $11,
        importance = COALESCE($12, importance), image_url = $13, updated_at = now()
      WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id, b.title_ml || null, b.title_en || null, b.summary_ml || null, b.summary_en || null,
     b.body_ml || null, b.body_en || null, b.source || null, b.source_url || null,
     category, b.district_id || null, importance, b.image_url || null]);
  return rows.length > 0;
}

export async function togglePublish(id, publish) {
  const rows = await run(
    `UPDATE health_news SET is_published = $2, updated_at = now() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
    [id, publish === true]);
  return rows.length > 0;
}

/** Bulk-create from pasted lines: "title_ml | summary_ml | source | category". */
export async function bulkCreate(text, defaults = {}) {
  const lines = String(text || '').split('\n').map((l) => l.trim()).filter(Boolean);
  let created = 0;
  for (const line of lines) {
    const [title_ml, summary_ml, source, category] = line.split('|').map((s) => (s || '').trim());
    if (!title_ml || !summary_ml) continue;
    const r = await createNews({ title_ml, summary_ml, source: source || defaults.source, category: category || defaults.category });
    if (r.ok) created += 1;
  }
  return { created, total: lines.length };
}

export { CATEGORIES, IMPORTANCE };
