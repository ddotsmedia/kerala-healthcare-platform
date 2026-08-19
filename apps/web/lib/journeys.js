// journeys.js — Treatment Journey Guides (content_items type='journey_guide').
// Educational, long-form. Public read-only.

import { getPool } from '@khp/db';

const PUB = `c.type = 'journey_guide' AND c.status = 'published' AND c.deleted_at IS NULL`;
const CARD = `c.id, c.slug, c.title_ml, c.title_en, c.excerpt_ml, c.excerpt_en,
  c.featured_image_url, c.journey_steps, c.published_at,
  coalesce(array_length(c.journey_steps, 1), 0) AS step_count`;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`journeys query failed: ${err.message}`); return []; }
}

/** All published journey guides (optionally filtered by specialty). */
export function listJourneys({ specialtyId } = {}) {
  if (specialtyId) {
    return run(
      `SELECT ${CARD} FROM content_items c WHERE ${PUB}
         AND EXISTS (SELECT 1 FROM content_item_specialties cis
                      WHERE cis.content_item_id = c.id AND cis.specialty_id = $1)
        ORDER BY c.published_at DESC NULLS LAST`, [specialtyId]);
  }
  return run(`SELECT ${CARD} FROM content_items c WHERE ${PUB} ORDER BY c.published_at DESC NULLS LAST`, []);
}

/** Specialties that have at least one journey (filter dropdown). */
export function journeySpecialties() {
  return run(
    `SELECT DISTINCT s.id, s.name_ml, s.name_en FROM content_items c
       JOIN content_item_specialties cis ON cis.content_item_id = c.id
       JOIN specialties s ON s.id = cis.specialty_id
      WHERE ${PUB} ORDER BY s.name_en`, []);
}

export async function getJourney(slug) {
  const rows = await run(`SELECT c.* FROM content_items c WHERE c.slug = $1 AND ${PUB}`, [slug]);
  const j = rows[0];
  if (!j) return null;
  j.specialties = await run(
    `SELECT sp.id, sp.slug, sp.name_ml, sp.name_en FROM content_item_specialties cis
       JOIN specialties sp ON sp.id = cis.specialty_id WHERE cis.content_item_id = $1`, [j.id]);
  return j;
}

/** Verified doctors for a journey's mapped specialty. */
export function journeyDoctors(contentItemId, limit = 3) {
  return run(
    `SELECT DISTINCT d.id, d.display_name, d.slug, d.photo_url, d.years_experience,
            d.consultation_fee, d.consultation_modes, d.languages, d.rating_avg, d.rating_count,
            s.name_ml AS specialty_ml, s.name_en AS specialty_en,
            di.name_ml AS district_ml, di.name_en AS district_en
       FROM content_item_specialties cis
       JOIN doctors d ON d.specialty_id = cis.specialty_id
        AND d.listing_status = 'published' AND d.verification_status = 'verified' AND d.deleted_at IS NULL
       LEFT JOIN specialties s ON s.id = d.specialty_id
       LEFT JOIN districts di ON di.id = d.district_id
      WHERE cis.content_item_id = $1 LIMIT $2`, [contentItemId, limit]);
}

export function allJourneySlugs() {
  return run(`SELECT c.slug FROM content_items c WHERE ${PUB} ORDER BY c.published_at DESC NULLS LAST`, []);
}

/** Normalise journey_steps (jsonb[]) → sorted array of plain step objects. */
export function sortedSteps(journey_steps) {
  const arr = Array.isArray(journey_steps) ? journey_steps : [];
  return arr
    .map((s) => (typeof s === 'string' ? JSON.parse(s) : s))
    .filter(Boolean)
    .sort((a, b) => (a.step_number || 0) - (b.step_number || 0));
}
