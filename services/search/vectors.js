// vectors.js
// Build parameterised UPDATE statements that populate the search_ml and
// search_manglish tsvector columns for a provider row.
// Parameterised SQL only — never string-concatenate values.

import { malayalamToLatin, normalizeLatin } from './transliterate.js';

const SEARCH_CONFIG = 'simple'; // language-agnostic; unaccent handles folding

/**
 * Compose the Malayalam search text for a doctor.
 * Includes district name so a free-text district search hits search_ml.
 * @param {object} d doctor row-ish { display_name, about_ml, district_ml, ... }
 */
function doctorMlText(d) {
  return [d.display_name, d.about_ml, d.district_ml, d.specialty_ml].filter(Boolean).join(' ');
}

/**
 * Compose the Manglish (romanised) search text for a doctor.
 * Romanises Malayalam fields, folds in English fields, district and specialty.
 */
function doctorManglishText(d) {
  const parts = [
    normalizeLatin(d.display_name || ''),
    malayalamToLatin(d.display_name || ''),
    normalizeLatin(d.about_en || ''),
    normalizeLatin(d.district_en || ''),
    malayalamToLatin(d.district_ml || ''),
    normalizeLatin(d.specialty_en || ''),
    malayalamToLatin(d.specialty_ml || '')
  ];
  return parts.filter(Boolean).join(' ');
}

function hospitalMlText(h) {
  return [h.name_ml, h.about_ml, h.district_ml].filter(Boolean).join(' ');
}

function hospitalManglishText(h) {
  const parts = [
    normalizeLatin(h.name_en || ''),
    malayalamToLatin(h.name_ml || ''),
    normalizeLatin(h.about_en || ''),
    normalizeLatin(h.district_en || ''),
    malayalamToLatin(h.district_ml || '')
  ];
  return parts.filter(Boolean).join(' ');
}

/**
 * @param {'doctors'|'hospitals'} table
 * @param {string} id row id
 * @param {string} mlText
 * @param {string} manglishText
 * @returns {{text: string, values: any[]}}
 */
function buildVectorUpdate(table, id, mlText, manglishText) {
  if (table !== 'doctors' && table !== 'hospitals') {
    throw new Error(`Unsupported table: ${table}`);
  }
  const text = `
    UPDATE ${table}
       SET search_ml = to_tsvector('${SEARCH_CONFIG}', unaccent($1)),
           search_manglish = to_tsvector('${SEARCH_CONFIG}', unaccent($2)),
           updated_at = now()
     WHERE id = $3`;
  return { text, values: [mlText, manglishText, id] };
}

/** Build the vector update for a doctor row. */
function doctorVectorUpdate(d) {
  return buildVectorUpdate('doctors', d.id, doctorMlText(d), doctorManglishText(d));
}

/** Build the vector update for a hospital row. */
function hospitalVectorUpdate(h) {
  return buildVectorUpdate('hospitals', h.id, hospitalMlText(h), hospitalManglishText(h));
}

export { doctorVectorUpdate, hospitalVectorUpdate, buildVectorUpdate, SEARCH_CONFIG };
