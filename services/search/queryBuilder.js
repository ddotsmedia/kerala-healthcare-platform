// queryBuilder.js
// Build parameterised directory search queries for doctors and hospitals.
// Only verified + published rows are searchable by default. Parameterised SQL only.

import { isMalayalam, malayalamToLatin, normalizeLatin } from './transliterate.js';
import { expandManglish } from './manglish.js';
import { SEARCH_CONFIG } from './vectors.js';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/** Normalise pagination input. */
function paginate(page, limit) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(MAX_LIMIT, Math.max(1, parseInt(limit, 10) || DEFAULT_LIMIT));
  return { page: p, limit: l, offset: (p - 1) * l };
}

/**
 * Pick the right vector column and normalise the term.
 * Malayalam -> search_ml; recognised Manglish medical term -> search_ml
 * (expanded); otherwise -> search_manglish (char transliteration).
 */
function resolveTerm(term) {
  const raw = (term || '').trim();
  if (!raw) return null;
  if (isMalayalam(raw)) return { column: 'search_ml', value: raw };
  const expanded = expandManglish(raw);
  if (expanded.hasMatch) return { column: 'search_ml', value: expanded.malayalam };
  return { column: 'search_manglish', value: normalizeLatin(raw) || malayalamToLatin(raw) };
}

/** Push a full-text term clause onto where/values for alias `a`. */
function pushTerm(term, alias, where, values) {
  const t = resolveTerm(term);
  if (!t) return;
  values.push(t.value);
  where.push(`${alias}.${t.column} @@ websearch_to_tsquery('${SEARCH_CONFIG}', unaccent($${values.length}))`);
}

/** Push an equality clause. */
function pushEq(val, expr, where, values) {
  if (val == null || val === '') return;
  values.push(val);
  where.push(`${expr} = $${values.length}`);
}

/**
 * Doctor directory search.
 * @param {object} o { term, districtId, specialtyId, consultationMode, language,
 *                     verificationStatus, page, limit }
 */
function buildDoctorSearch(o = {}) {
  const { offset, limit, page } = paginate(o.page, o.limit);
  const where = ['d.deleted_at IS NULL', "d.listing_status = 'published'"];
  const values = [];

  pushEq(o.verificationStatus || 'verified', 'd.verification_status', where, values);
  pushTerm(o.term, 'd', where, values);
  pushEq(o.districtId, 'd.district_id', where, values);
  pushEq(o.specialtyId, 'd.specialty_id', where, values);
  if (o.consultationMode) {
    values.push(o.consultationMode);
    where.push(`$${values.length} = ANY(d.consultation_modes)`);
  }
  if (o.language) {
    values.push(o.language);
    where.push(`$${values.length} = ANY(d.languages)`);
  }

  values.push(limit); const limitIdx = values.length;
  values.push(offset); const offsetIdx = values.length;

  const text = `
    SELECT d.id, d.display_name, d.slug, d.photo_url, d.years_experience,
           d.consultation_fee, d.consultation_modes, d.languages,
           d.rating_avg, d.rating_count,
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
 * Hospital directory search.
 * @param {object} o { term, districtId, serviceSlug, department,
 *                     verificationStatus, page, limit }
 */
function buildHospitalSearch(o = {}) {
  const { offset, limit, page } = paginate(o.page, o.limit);
  const where = ['h.deleted_at IS NULL', "h.listing_status = 'published'"];
  const values = [];

  pushEq(o.verificationStatus || 'verified', 'h.verification_status', where, values);
  pushTerm(o.term, 'h', where, values);
  pushEq(o.districtId, 'h.district_id', where, values);
  if (o.serviceSlug) {
    values.push(o.serviceSlug);
    where.push(`EXISTS (SELECT 1 FROM hospital_services hs
                         WHERE hs.hospital_id = h.id AND hs.deleted_at IS NULL
                           AND hs.available = true AND hs.service_slug = $${values.length})`);
  }
  if (o.department) {
    values.push(`%${o.department}%`);
    where.push(`EXISTS (SELECT 1 FROM hospital_departments hd
                         WHERE hd.hospital_id = h.id AND hd.deleted_at IS NULL
                           AND (hd.name_en ILIKE $${values.length} OR hd.name_ml ILIKE $${values.length}))`);
  }

  values.push(limit); const limitIdx = values.length;
  values.push(offset); const offsetIdx = values.length;

  const text = `
    SELECT h.id, h.name_ml, h.name_en, h.slug, h.logo_url, h.type,
           h.emergency_24x7, h.bed_count, h.rating_avg, h.rating_count,
           di.name_ml AS district_ml, di.name_en AS district_en
      FROM hospitals h
      LEFT JOIN districts di ON di.id = h.district_id
     WHERE ${where.join(' AND ')}
     ORDER BY h.published_at DESC NULLS LAST
     LIMIT $${limitIdx} OFFSET $${offsetIdx}`;
  return { text, values, meta: { page, limit } };
}

/**
 * Unified search — builds both queries. The caller runs each against the pool
 * and merges into { doctors, hospitals }.
 * @param {object} o shared filter object (see the two builders above)
 * @returns {{ doctors: object, hospitals: object }}
 */
function searchAll(o = {}) {
  return { doctors: buildDoctorSearch(o), hospitals: buildHospitalSearch(o) };
}

export {
  buildDoctorSearch, buildHospitalSearch, searchAll,
  resolveTerm, paginate, DEFAULT_LIMIT, MAX_LIMIT
};
