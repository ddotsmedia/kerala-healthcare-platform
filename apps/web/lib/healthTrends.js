// healthTrends.js — public health intelligence aggregated from anonymous
// search_logs. No personal data. Read-only.

import { getPool } from '@khp/db';

async function rows(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`healthTrends query failed: ${err.message}`); return []; }
}
const clampDays = (d, def) => Math.max(1, Math.min(365, parseInt(d, 10) || def));

/** Most-searched conditions/terms this period (excludes filter-only searches). */
export function topConditions(days = 30, limit = 15) {
  const d = clampDays(days, 30);
  return rows(
    `SELECT lower(query) AS query, count(*)::int AS searches
       FROM search_logs
      WHERE searched_at > now() - make_interval(days => $1)
        AND query <> '(filters only)' AND length(trim(query)) > 1
      GROUP BY lower(query) ORDER BY searches DESC LIMIT $2`, [d, limit]);
}

/** District-wise search activity (from the district filter). */
export function districtSearches(days = 30) {
  const d = clampDays(days, 30);
  return rows(
    `SELECT di.name_en, di.name_ml, count(*)::int AS searches
       FROM search_logs sl
       JOIN districts di ON di.id = (sl.filters->>'district_id')::uuid
      WHERE sl.searched_at > now() - make_interval(days => $1) AND sl.filters ? 'district_id'
      GROUP BY di.name_en, di.name_ml ORDER BY searches DESC`, [d]);
}

// Seasonal awareness (general public-health information, not a diagnosis).
export const SEASONS = [
  { key: 'monsoon', months: [5, 6, 7, 8], label_en: 'Monsoon (Jun–Sep)', label_ml: 'മൺസൂൺ (ജൂൺ–സെപ്റ്റംബർ)',
    conditions_en: ['Dengue', 'Leptospirosis', 'Viral fever', 'Cholera', 'Chikungunya'],
    conditions_ml: ['ഡെങ്കിപ്പനി', 'എലിപ്പനി', 'വൈറൽ പനി', 'കോളറ', 'ചിക്കുൻഗുനിയ'] },
  { key: 'winter', months: [10, 11, 0, 1], label_en: 'Winter (Nov–Feb)', label_ml: 'ശീതകാലം (നവംബർ–ഫെബ്രുവരി)',
    conditions_en: ['Influenza / Flu', 'Common cold', 'Asthma', 'Pneumonia'],
    conditions_ml: ['ഇൻഫ്ലുവൻസ / ഫ്ലൂ', 'ജലദോഷം', 'ആസ്ത്മ', 'ന്യുമോണിയ'] },
  { key: 'summer', months: [2, 3, 4], label_en: 'Summer (Mar–May)', label_ml: 'വേനൽ (മാർച്ച്–മെയ്)',
    conditions_en: ['Heat exhaustion', 'Chickenpox', 'Food poisoning', 'Sunstroke'],
    conditions_ml: ['ചൂട് ക്ഷീണം', 'ചിക്കൻപോക്സ്', 'ഭക്ഷ്യവിഷബാധ', 'സൂര്യാഘാതം'] }
];

/** @param {number} monthIndex 0-11 */
export function currentSeasonKey(monthIndex) {
  const s = SEASONS.find((x) => x.months.includes(monthIndex));
  return s ? s.key : 'monsoon';
}
