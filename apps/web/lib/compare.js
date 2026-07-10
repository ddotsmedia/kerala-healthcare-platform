// compare.js — load hospitals for side-by-side comparison. Uses existing data
// only (no new schema). Verified + published hospitals. Fails soft.

import { getPool } from '@khp/db';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_COMPARE = 3;

/** Parse + sanitise a `?h=id1,id2,id3` param → up to 3 valid uuids. */
function parseCompareIds(raw) {
  return String(raw || '')
    .split(',').map((s) => s.trim()).filter((s) => UUID_RE.test(s))
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .slice(0, MAX_COMPARE);
}

/** Load hospitals for comparison, preserving the requested id order. */
async function getHospitalsForCompare(ids) {
  const list = Array.isArray(ids) ? ids.filter((s) => UUID_RE.test(s)).slice(0, MAX_COMPARE) : [];
  if (!list.length) return [];
  try {
    const { rows } = await getPool().query(
      `SELECT h.id, h.slug, h.name_ml, h.name_en, h.type, h.bed_count, h.icu_beds, h.nicu_beds,
              h.emergency_24x7, h.rating_avg, h.rating_count,
              di.name_ml AS district_ml, di.name_en AS district_en,
              (SELECT array_agg(DISTINCT s.service_slug) FROM hospital_services s
                 WHERE s.hospital_id = h.id AND s.deleted_at IS NULL AND s.service_slug IS NOT NULL) AS service_slugs,
              (SELECT array_agg(DISTINCT a.body) FROM hospital_accreditations a
                 WHERE a.hospital_id = h.id AND a.deleted_at IS NULL) AS accreditations,
              (SELECT count(*) FROM hospital_departments d
                 WHERE d.hospital_id = h.id AND d.deleted_at IS NULL) AS dept_count
         FROM hospitals h
         LEFT JOIN districts di ON di.id = h.district_id
        WHERE h.id = ANY($1::uuid[]) AND h.deleted_at IS NULL
          AND h.listing_status = 'published' AND h.verification_status = 'verified'`,
      [list]
    );
    const byId = new Map(rows.map((r) => [r.id, r]));
    return list.map((id) => byId.get(id)).filter(Boolean);
  } catch (err) {
    console.error(`compare query failed: ${err.message}`);
    return [];
  }
}

export { getHospitalsForCompare, parseCompareIds, MAX_COMPARE };
