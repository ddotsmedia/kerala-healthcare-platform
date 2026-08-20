// wellness.js — Yoga & Wellness content (content_items type='wellness').
// Educational only. Public read-only.

import { getPool } from '@khp/db';

export const WELLNESS_CATEGORIES = [
  { slug: 'yoga', ml: 'യോഗ', en: 'Yoga', icon: '🧘' },
  { slug: 'meditation', ml: 'ധ്യാനം', en: 'Meditation', icon: '🕉️' },
  { slug: 'breathing', ml: 'ശ്വസനം', en: 'Breathing', icon: '🌬️' },
  { slug: 'fitness', ml: 'ഫിറ്റ്നസ്', en: 'Fitness', icon: '🚶' },
  { slug: 'sleep', ml: 'ഉറക്കം', en: 'Sleep', icon: '😴' },
  { slug: 'stress', ml: 'സ്ട്രെസ്', en: 'Stress', icon: '🧠' }
];
const PUB = `c.type = 'wellness' AND c.status = 'published' AND c.deleted_at IS NULL`;
const CARD = `c.id, c.slug, c.title_ml, c.title_en, c.excerpt_ml, c.excerpt_en, c.featured_image_url`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`wellness query failed: ${err.message}`); return []; }
}

export function listWellness({ category } = {}) {
  if (category) {
    return run(
      `SELECT ${CARD} FROM content_items c
         JOIN content_item_categories cic ON cic.content_item_id = c.id
         JOIN content_categories cat ON cat.id = cic.category_id AND cat.slug = $1
        WHERE ${PUB} ORDER BY c.title_en`, [category]);
  }
  return run(`SELECT ${CARD} FROM content_items c WHERE ${PUB} ORDER BY c.title_en`, []);
}

export async function getWellness(slug) {
  const rows = await run(`SELECT c.* FROM content_items c WHERE c.slug = $1 AND ${PUB}`, [slug]);
  const w = rows[0];
  if (!w) return null;
  w.categories = await run(
    `SELECT cat.slug, cat.name_ml, cat.name_en FROM content_item_categories cic
       JOIN content_categories cat ON cat.id = cic.category_id WHERE cic.content_item_id = $1`, [w.id]);
  return w;
}

export function allWellnessSlugs() {
  return run(`SELECT c.slug FROM content_items c WHERE ${PUB} ORDER BY c.title_en`, []);
}
