// labTests.js — Lab Test Guide. Educational only. Public read-only.
// Search by test name OR abbreviation.

import { getPool } from '@khp/db';

export const LAB_CATEGORIES = [
  { key: 'blood', ml: 'രക്തം', en: 'Blood' },
  { key: 'urine', ml: 'മൂത്രം', en: 'Urine' },
  { key: 'imaging', ml: 'ഇമേജിംഗ്', en: 'Imaging' },
  { key: 'heart', ml: 'ഹൃദയം', en: 'Heart' },
  { key: 'hormones', ml: 'ഹോർമോണുകൾ', en: 'Hormones' },
  { key: 'infection', ml: 'അണുബാധ', en: 'Infection' },
  { key: 'cancer', ml: 'കാൻസർ മാർക്കറുകൾ', en: 'Cancer Markers' }
];
const CATEGORY_KEYS = new Set(LAB_CATEGORIES.map((c) => c.key));
const PUB = `t.is_published = true AND t.deleted_at IS NULL`;
const CARD = `t.id, t.slug, t.name_ml, t.name_en, t.abbreviation, t.category,
  (t.preparation_en IS NOT NULL AND t.preparation_en ILIKE '%fast%') AS prep_required`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`lab tests query failed: ${err.message}`); return []; }
}

const nameMatch = (idx) => `(t.name_en ILIKE $${idx} OR t.name_ml ILIKE $${idx} OR t.abbreviation ILIKE $${idx})`;

/** List/search published tests. @param {object} o { q, category, letter, page, limit } */
export function listLabTests({ q, category, letter, page = 1, limit = 24 } = {}) {
  const where = [PUB]; const values = [];
  if (q && q.trim()) { values.push(`%${q.trim()}%`); where.push(nameMatch(values.length)); }
  if (category && CATEGORY_KEYS.has(category)) { values.push(category); where.push(`t.category = $${values.length}`); }
  if (letter && /^[a-z]$/i.test(letter)) { values.push(`${letter.toLowerCase()}%`); where.push(`lower(t.name_en) LIKE $${values.length}`); }
  const lim = Math.min(60, Math.max(1, parseInt(limit, 10) || 24));
  const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;
  values.push(lim); const li = values.length;
  values.push(off); const oi = values.length;
  return run(
    `SELECT ${CARD} FROM lab_test_guides t WHERE ${where.join(' AND ')}
      ORDER BY t.name_en ASC LIMIT $${li} OFFSET $${oi}`, values);
}

/** Autocomplete — name or abbreviation. */
export function searchLabTests({ term, limit = 8 } = {}) {
  if (!term || !term.trim()) return Promise.resolve([]);
  const values = [`%${term.trim()}%`, Math.min(20, Math.max(1, parseInt(limit, 10) || 8))];
  return run(
    `SELECT ${CARD} FROM lab_test_guides t
      WHERE ${PUB} AND ${nameMatch(1)}
      ORDER BY (lower(t.abbreviation) = lower(trim(both '%' from $1))) DESC, t.name_en ASC
      LIMIT $2`, values);
}

export function getLabTestBySlug(slug) {
  return run(`SELECT t.* FROM lab_test_guides t WHERE t.slug = $1 AND ${PUB}`, [slug]).then((r) => r[0] || null);
}

export function allLabTestSlugs() {
  return run(`SELECT slug FROM lab_test_guides t WHERE ${PUB} ORDER BY t.name_en`, []);
}
