// medicines.js — Medicine Information Centre. Educational, never prescriptive.
// Public read-only. Search by generic OR brand name.

import { getPool } from '@khp/db';

export const MED_CATEGORIES = [
  { key: 'antibiotics', ml: 'ആന്റിബയോട്ടിക്കുകൾ', en: 'Antibiotics' },
  { key: 'diabetes', ml: 'പ്രമേഹം', en: 'Diabetes' },
  { key: 'heart', ml: 'ഹൃദയം', en: 'Heart' },
  { key: 'pain', ml: 'വേദന', en: 'Pain' },
  { key: 'allergy', ml: 'അലർജി', en: 'Allergy' },
  { key: 'gastrointestinal', ml: 'ദഹനവ്യവസ്ഥ', en: 'Gastrointestinal' }
];
const CATEGORY_KEYS = new Set(MED_CATEGORIES.map((c) => c.key));
const PUB = `m.is_published = true AND m.deleted_at IS NULL`;
const CARD = `m.id, m.slug, m.generic_name_ml, m.generic_name_en, m.brand_names,
  m.drug_class, m.therapeutic_category, m.is_otc, m.pregnancy_category`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`medicines query failed: ${err.message}`); return []; }
}

const brandMatch = (idx) => `EXISTS (SELECT 1 FROM unnest(m.brand_names) b WHERE b ILIKE $${idx})`;

/** List/search published medicines. @param {object} o { q, category, letter, page, limit } */
export function listMedicines({ q, category, letter, page = 1, limit = 24 } = {}) {
  const where = [PUB]; const values = [];
  if (q && q.trim()) {
    values.push(`%${q.trim()}%`);
    where.push(`(m.generic_name_en ILIKE $${values.length} OR m.generic_name_ml ILIKE $${values.length} OR ${brandMatch(values.length)})`);
  }
  if (category && CATEGORY_KEYS.has(category)) { values.push(category); where.push(`m.therapeutic_category = $${values.length}`); }
  if (letter && /^[a-z]$/i.test(letter)) { values.push(`${letter.toLowerCase()}%`); where.push(`lower(m.generic_name_en) LIKE $${values.length}`); }
  const lim = Math.min(60, Math.max(1, parseInt(limit, 10) || 24));
  const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;
  values.push(lim); const li = values.length;
  values.push(off); const oi = values.length;
  return run(
    `SELECT ${CARD} FROM medicines m WHERE ${where.join(' AND ')}
      ORDER BY m.generic_name_en ASC LIMIT $${li} OFFSET $${oi}`, values);
}

/** Lightweight autocomplete — generic or brand prefix/substring. */
export function searchMedicines({ term, limit = 8 } = {}) {
  if (!term || !term.trim()) return Promise.resolve([]);
  const values = [`%${term.trim()}%`, Math.min(20, Math.max(1, parseInt(limit, 10) || 8))];
  return run(
    `SELECT ${CARD} FROM medicines m
      WHERE ${PUB} AND (m.generic_name_en ILIKE $1 OR m.generic_name_ml ILIKE $1 OR ${brandMatch(1)})
      ORDER BY (lower(m.generic_name_en) LIKE lower($1)) DESC, m.generic_name_en ASC
      LIMIT $2`, values);
}

export function getMedicineBySlug(slug) {
  return run(`SELECT m.* FROM medicines m WHERE m.slug = $1 AND ${PUB}`, [slug]).then((r) => r[0] || null);
}

/** Distinct first letters present (A-Z index). */
export async function azLetters() {
  const rows = await run(
    `SELECT DISTINCT upper(left(generic_name_en, 1)) AS l FROM medicines m WHERE ${PUB} ORDER BY l`, []);
  return rows.map((r) => r.l).filter((l) => /^[A-Z]$/.test(l));
}

export function allMedicineSlugs() {
  return run(`SELECT slug FROM medicines m WHERE ${PUB} ORDER BY m.generic_name_en`, []);
}
