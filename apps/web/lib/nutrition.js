// nutrition.js — Kerala foods & nutrition. Educational only. Public read-only.

import { getPool } from '@khp/db';

export const FOOD_CATEGORIES = [
  { key: 'grain', ml: 'ധാന്യം', en: 'Grains' },
  { key: 'vegetable', ml: 'പച്ചക്കറി', en: 'Vegetables' },
  { key: 'fruit', ml: 'പഴം', en: 'Fruits' },
  { key: 'protein', ml: 'പ്രോട്ടീൻ', en: 'Protein' },
  { key: 'dairy', ml: 'പാലുൽപന്നം', en: 'Dairy' },
  { key: 'spice', ml: 'സുഗന്ധവ്യഞ്ജനം', en: 'Spices' }
];
export const GOOD_FOR = [
  { key: 'diabetes', ml: 'പ്രമേഹം', en: 'Diabetes' },
  { key: 'heart', ml: 'ഹൃദയം', en: 'Heart' },
  { key: 'weight_loss', ml: 'ഭാരം കുറയ്ക്കൽ', en: 'Weight loss' },
  { key: 'pregnancy', ml: 'ഗർഭകാലം', en: 'Pregnancy' },
  { key: 'immunity', ml: 'പ്രതിരോധശേഷി', en: 'Immunity' },
  { key: 'bone_health', ml: 'അസ്ഥി ആരോഗ്യം', en: 'Bone health' },
  { key: 'digestion', ml: 'ദഹനം', en: 'Digestion' }
];
const CAT_KEYS = new Set(FOOD_CATEGORIES.map((c) => c.key));
const PUB = `f.is_published = true AND f.deleted_at IS NULL`;
const CARD = `f.id, f.slug, f.name_ml, f.name_en, f.category, f.calories_per_100g,
  f.protein_g, f.carbs_g, f.fat_g, f.fiber_g, f.good_for`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`nutrition query failed: ${err.message}`); return []; }
}

export function listFoods({ q, category, goodFor, page = 1, limit = 24 } = {}) {
  const where = [PUB]; const values = [];
  if (q && q.trim()) { values.push(`%${q.trim()}%`); where.push(`(f.name_en ILIKE $${values.length} OR f.name_ml ILIKE $${values.length})`); }
  if (category && CAT_KEYS.has(category)) { values.push(category); where.push(`f.category = $${values.length}`); }
  if (goodFor) { values.push(goodFor); where.push(`$${values.length} = ANY(f.good_for)`); }
  const lim = Math.min(60, Math.max(1, parseInt(limit, 10) || 24));
  const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;
  values.push(lim); const li = values.length;
  values.push(off); const oi = values.length;
  return run(`SELECT ${CARD} FROM foods f WHERE ${where.join(' AND ')} ORDER BY f.name_en LIMIT $${li} OFFSET $${oi}`, values);
}

export function searchFoods({ term, limit = 8 } = {}) {
  if (!term || !term.trim()) return Promise.resolve([]);
  const values = [`%${term.trim()}%`, Math.min(20, Math.max(1, parseInt(limit, 10) || 8))];
  return run(`SELECT ${CARD} FROM foods f WHERE ${PUB} AND (f.name_en ILIKE $1 OR f.name_ml ILIKE $1) ORDER BY f.name_en LIMIT $2`, values);
}

export function getFoodBySlug(slug) {
  return run(`SELECT f.* FROM foods f WHERE f.slug = $1 AND ${PUB}`, [slug]).then((r) => r[0] || null);
}

export function allFoodSlugs() {
  return run(`SELECT slug FROM foods f WHERE ${PUB} ORDER BY f.name_en`, []);
}
