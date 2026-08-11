// procedures.js — Medical Procedure Library. Educational only. Public read-only.

import { getPool } from '@khp/db';

export const PROC_CATEGORIES = [
  { key: 'surgery', ml: 'ശസ്ത്രക്രിയ', en: 'Surgery' },
  { key: 'diagnostic', ml: 'ഡയഗ്നോസ്റ്റിക്', en: 'Diagnostic' },
  { key: 'therapeutic', ml: 'ചികിത്സാ', en: 'Therapeutic' },
  { key: 'cosmetic', ml: 'സൗന്ദര്യ', en: 'Cosmetic' },
  { key: 'dental', ml: 'ദന്ത', en: 'Dental' }
];
export const ANAESTHESIA = [
  { key: 'none', ml: 'ഇല്ല', en: 'None' },
  { key: 'local', ml: 'ലോക്കൽ', en: 'Local' },
  { key: 'regional', ml: 'റീജിയണൽ', en: 'Regional' },
  { key: 'general', ml: 'ജനറൽ', en: 'General' }
];
const CAT_KEYS = new Set(PROC_CATEGORIES.map((c) => c.key));
const ANAES_KEYS = new Set(ANAESTHESIA.map((a) => a.key));
const PUB = `p.is_published = true AND p.deleted_at IS NULL`;
const CARD = `p.id, p.slug, p.name_ml, p.name_en, p.category, p.anaesthesia_type,
  p.hospital_stay_days_min, p.hospital_stay_days_max, p.specialty_id,
  s.name_ml AS specialty_ml, s.name_en AS specialty_en, s.slug AS specialty_slug`;
const JOIN = `LEFT JOIN specialties s ON s.id = p.specialty_id`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`procedures query failed: ${err.message}`); return []; }
}

/** List/filter published procedures. @param {object} o { q, category, specialtyId, anaesthesia, stay, page, limit } */
export function listProcedures({ q, category, specialtyId, anaesthesia, stay, page = 1, limit = 24 } = {}) {
  const where = [PUB]; const values = [];
  if (q && q.trim()) { values.push(`%${q.trim()}%`); where.push(`(p.name_en ILIKE $${values.length} OR p.name_ml ILIKE $${values.length})`); }
  if (category && CAT_KEYS.has(category)) { values.push(category); where.push(`p.category = $${values.length}`); }
  if (specialtyId) { values.push(specialtyId); where.push(`p.specialty_id = $${values.length}`); }
  if (anaesthesia && ANAES_KEYS.has(anaesthesia)) { values.push(anaesthesia); where.push(`p.anaesthesia_type = $${values.length}`); }
  if (stay === 'yes') where.push(`p.hospital_stay_days_max > 0`);
  else if (stay === 'no') where.push(`p.hospital_stay_days_max = 0`);
  const lim = Math.min(60, Math.max(1, parseInt(limit, 10) || 24));
  const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;
  values.push(lim); const li = values.length;
  values.push(off); const oi = values.length;
  return run(
    `SELECT ${CARD} FROM procedures p ${JOIN} WHERE ${where.join(' AND ')}
      ORDER BY p.name_en ASC LIMIT $${li} OFFSET $${oi}`, values);
}

export function searchProcedures({ term, limit = 8 } = {}) {
  if (!term || !term.trim()) return Promise.resolve([]);
  const values = [`%${term.trim()}%`, Math.min(20, Math.max(1, parseInt(limit, 10) || 8))];
  return run(
    `SELECT ${CARD} FROM procedures p ${JOIN}
      WHERE ${PUB} AND (p.name_en ILIKE $1 OR p.name_ml ILIKE $1)
      ORDER BY p.name_en ASC LIMIT $2`, values);
}

export function getProcedureBySlug(slug) {
  return run(
    `SELECT p.*, s.name_ml AS specialty_ml, s.name_en AS specialty_en, s.slug AS specialty_slug
       FROM procedures p ${JOIN} WHERE p.slug = $1 AND ${PUB}`, [slug]).then((r) => r[0] || null);
}

export function allProcedureSlugs() {
  return run(`SELECT slug FROM procedures p WHERE ${PUB} ORDER BY p.name_en`, []);
}
