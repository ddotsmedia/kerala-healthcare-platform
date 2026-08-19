// diseases.js — Disease encyclopedia index: A-Z, category filter, symptom search.
// Published content_items of type 'disease'. Educational only.

import { getPool } from '@khp/db';

const PUB = `c.type = 'disease' AND c.status = 'published' AND c.deleted_at IS NULL`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`diseases query failed: ${err.message}`); return []; }
}

/** Categories that have at least one published disease. */
export function diseaseCategories() {
  return run(
    `SELECT DISTINCT cat.slug, cat.name_ml, cat.name_en, count(*)::int AS n
       FROM content_items c
       JOIN content_item_categories cic ON cic.content_item_id = c.id
       JOIN content_categories cat ON cat.id = cic.category_id
      WHERE ${PUB} GROUP BY cat.slug, cat.name_ml, cat.name_en ORDER BY cat.name_en`, []);
}

/** Count of diseases per first letter (A-Z index). */
export async function letterCounts() {
  const rows = await run(
    `SELECT upper(left(c.title_en, 1)) AS letter, count(*)::int AS n
       FROM content_items c WHERE ${PUB} GROUP BY letter`, []);
  const out = {};
  for (const r of rows) if (/^[A-Z]$/.test(r.letter)) out[r.letter] = r.n;
  return out;
}

/**
 * List diseases with optional filters.
 * @param {object} o { category (slug), letter, symptom }
 */
export function listDiseasesFull({ category, letter, symptom } = {}) {
  const where = [PUB]; const values = [];
  let join = '';
  if (category) {
    values.push(category);
    join = `JOIN content_item_categories cic ON cic.content_item_id = c.id
            JOIN content_categories cat ON cat.id = cic.category_id AND cat.slug = $${values.length}`;
  }
  if (letter && /^[a-z]$/i.test(letter)) { values.push(`${letter.toUpperCase()}%`); where.push(`c.title_en ILIKE $${values.length}`); }
  if (symptom && symptom.trim()) {
    values.push(`%${symptom.trim()}%`);
    const i = values.length;
    where.push(`(c.title_en ILIKE $${i} OR c.title_ml ILIKE $${i} OR EXISTS (
        SELECT 1 FROM disease_details dd
         WHERE dd.content_item_id = c.id
           AND (EXISTS (SELECT 1 FROM unnest(coalesce(dd.symptoms_en,'{}')) s WHERE s ILIKE $${i})
             OR EXISTS (SELECT 1 FROM unnest(coalesce(dd.symptoms_ml,'{}')) s WHERE s ILIKE $${i}))))`);
  }
  return run(
    `SELECT DISTINCT c.slug, c.title_ml, c.title_en, c.excerpt_ml, c.excerpt_en
       FROM content_items c ${join} WHERE ${where.join(' AND ')} ORDER BY c.title_en`, values);
}

export async function diseaseCount() {
  const r = await run(`SELECT count(*)::int AS n FROM content_items c WHERE ${PUB}`, []);
  return r[0] ? r[0].n : 0;
}
