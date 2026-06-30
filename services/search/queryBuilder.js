// queryBuilder.js
// Build parameterised directory search queries for doctors and hospitals.
// Only verified + published rows are searchable. Parameterised SQL only.

import { isMalayalam, malayalamToLatin, normalizeLatin } from './transliterate.js';
import { expandManglish } from './manglish.js';
import { SEARCH_CONFIG } from './vectors.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/**
 * Normalise pagination input.
 * @returns {{ page: number, limit: number, offset: number }}
 */
function paginate(page, limit) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));
  return { page: p, limit: l, offset: (p - 1) * l };
}

/**
 * Pick the right vector column and normalise the term for the query script.
 * Priority:
 *   1. Malayalam script input -> search_ml.
 *   2. Manglish medical term recognised by manglish.js -> search_ml (expanded
 *      to Malayalam), so dictionary terms beat char-level transliteration.
 *   3. Otherwise Latin/Manglish -> search_manglish (char transliteration).
 */
function resolveTerm(term) {
  const raw = (term || '').trim();
  if (!raw) return null;
  if (isMalayalam(raw)) {
    return { column: 'search_ml', value: raw };
  }
  const expanded = expandManglish(raw);
  if (expanded.hasMatch) {
    return { column: 'search_ml', value: expanded.malayalam };
  }
  return { column: 'search_manglish', value: normalizeLatin(raw) || malayalamToLatin(raw) };
}

/**
 * Build a doctor directory search.
 * @param {object} opts { term, districtId, specialtyId, page, limit }
 * @returns {{ text: string, values: any[], meta: object }}
 */
function buildDoctorSearch(opts = {}) {
  const { offset, limit, page } = paginate(opts.page, opts.limit);
  const where = [`d.deleted_at IS NULL`, `d.listing_status = 'published'`, `d.verification_status = 'verified'`];
  const values = [];

  const t = resolveTerm(opts.term);
  if (t) {
    values.push(t.value);
    where.push(`d.${t.column} @@ websearch_to_tsquery('${SEARCH_CONFIG}', unaccent($${values.length}))`);
  }
  if (opts.districtId) {
    values.push(opts.districtId);
    where.push(`d.district_id = $${values.length}`);
  }
  if (opts.specialtyId) {
    values.push(opts.specialtyId);
    where.push(`d.specialty_id = $${values.length}`);
  }

  values.push(limit);
  const limitIdx = values.length;
  values.push(offset);
  const offsetIdx = values.length;

  const text = `
    SELECT d.id, d.display_name, d.slug, d.photo_url, d.years_experience,
           d.consultation_fee, d.languages,
           s.name_ml AS specialty_ml, s.name_en AS specialty_en,
           di.name_ml AS district_ml, di.name_en AS district_en
      FROM doctors d
      LEFT JOIN specialties s ON s.id = d.specialty_id
      LEFT JOIN districts di ON di.id = d.district_id
     WHERE ${where.join(' AND ')}
     ORDER BY d.published_at DESC NULLS LAST
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`;

  return { text, values, meta: { page, limit } };
}

/**
 * Build a hospital directory search.
 * @param {object} opts { term, districtId, page, limit }
 * @returns {{ text: string, values: any[], meta: object }}
 */
function buildHospitalSearch(opts = {}) {
  const { offset, limit, page } = paginate(opts.page, opts.limit);
  const where = [`h.deleted_at IS NULL`, `h.listing_status = 'published'`, `h.verification_status = 'verified'`];
  const values = [];

  const t = resolveTerm(opts.term);
  if (t) {
    values.push(t.value);
    where.push(`h.${t.column} @@ websearch_to_tsquery('${SEARCH_CONFIG}', unaccent($${values.length}))`);
  }
  if (opts.districtId) {
    values.push(opts.districtId);
    where.push(`h.district_id = $${values.length}`);
  }

  values.push(limit);
  const limitIdx = values.length;
  values.push(offset);
  const offsetIdx = values.length;

  const text = `
    SELECT h.id, h.name_ml, h.name_en, h.slug, h.logo_url,
           h.emergency_24x7, h.bed_count,
           di.name_ml AS district_ml, di.name_en AS district_en
      FROM hospitals h
      LEFT JOIN districts di ON di.id = h.district_id
     WHERE ${where.join(' AND ')}
     ORDER BY h.published_at DESC NULLS LAST
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`;

  return { text, values, meta: { page, limit } };
}

export { buildDoctorSearch, buildHospitalSearch, resolveTerm, paginate, DEFAULT_LIMIT, MAX_LIMIT };
