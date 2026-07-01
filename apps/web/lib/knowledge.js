// knowledge.js — public read access for symptoms, articles, and diseases.
// Only published content is exposed. Parameterised SQL only. Fails soft.

import { getPool } from '@khp/db';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`knowledge query failed: ${err.message}`); return []; }
}

/** All symptoms. */
function listSymptoms() {
  return run(`SELECT id, slug, name_ml, name_en, icon_name FROM symptoms WHERE deleted_at IS NULL ORDER BY name_en`, []);
}

/** Symptom + mapped specialties with urgency. */
async function getSymptom(slug) {
  const s = (await run(`SELECT id, slug, name_ml, name_en, icon_name FROM symptoms WHERE slug = $1 AND deleted_at IS NULL`, [slug]))[0];
  if (!s) return null;
  s.specialties = await run(
    `SELECT sp.id, sp.slug, sp.name_ml, sp.name_en, ss.urgency_level
       FROM symptom_specialties ss JOIN specialties sp ON sp.id = ss.specialty_id
      WHERE ss.symptom_id = $1
      ORDER BY CASE ss.urgency_level WHEN 'emergency' THEN 0 WHEN 'urgent' THEN 1 WHEN 'soon' THEN 2 ELSE 3 END`,
    [s.id]);
  return s;
}

/** Doctors for a symptom's top specialty (verified + published). */
async function symptomDoctors(slug, limit = 6) {
  return run(
    `SELECT d.id, d.display_name, d.slug, d.photo_url,
            di.name_ml AS district_ml, di.name_en AS district_en
       FROM symptoms s
       JOIN symptom_specialties ss ON ss.symptom_id = s.id
       JOIN doctors d ON d.specialty_id = ss.specialty_id
       LEFT JOIN districts di ON di.id = d.district_id
      WHERE s.slug = $1 AND d.deleted_at IS NULL
        AND d.listing_status = 'published' AND d.verification_status = 'verified'
      ORDER BY CASE ss.urgency_level WHEN 'emergency' THEN 0 WHEN 'urgent' THEN 1 WHEN 'soon' THEN 2 ELSE 3 END,
               d.published_at DESC NULLS LAST
      LIMIT $2`,
    [slug, limit]);
}

/** Published content feed, optional type filter, paginated. */
function listPublishedContent({ type, page = 1, limit = 20 } = {}) {
  const where = [`deleted_at IS NULL`, `status = 'published'`];
  const values = [];
  if (type) { values.push(type); where.push(`type = $${values.length}`); }
  const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;
  values.push(lim); const li = values.length; values.push(off); const oi = values.length;
  return run(
    `SELECT id, slug, type, title_ml, title_en, excerpt_ml, excerpt_en, published_at
       FROM content_items WHERE ${where.join(' AND ')}
      ORDER BY published_at DESC NULLS LAST LIMIT $${li} OFFSET $${oi}`, values);
}

/** Published content by slug, with disease_details + related specialties. */
async function getPublishedContent(slug) {
  const c = (await run(
    `SELECT * FROM content_items WHERE slug = $1 AND status = 'published' AND deleted_at IS NULL`, [slug]))[0];
  if (!c) return null;
  if (c.type === 'disease') {
    c.disease = (await run(`SELECT * FROM disease_details WHERE content_item_id = $1 AND deleted_at IS NULL`, [c.id]))[0] || null;
  }
  c.specialties = await run(
    `SELECT sp.slug, sp.name_ml, sp.name_en FROM content_item_specialties cis
       JOIN specialties sp ON sp.id = cis.specialty_id WHERE cis.content_item_id = $1`, [c.id]);
  return c;
}

/** A–Z published diseases. */
function listDiseases() {
  return run(
    `SELECT slug, title_ml, title_en FROM content_items
      WHERE type = 'disease' AND status = 'published' AND deleted_at IS NULL
      ORDER BY title_en`, []);
}

export { listSymptoms, getSymptom, symptomDoctors, listPublishedContent, getPublishedContent, listDiseases };
