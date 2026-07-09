// ambulance.js — ambulance-provider directory data access. Verified only.
// Emergency-first: list returns ALL matches (no pagination). Fails soft.

import { getPool } from '@khp/db';

const AMBULANCE_TYPES = ['basic', 'advanced', 'icu', 'nicu', 'mortuary', 'air'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`ambulance query failed: ${err.message}`); return []; }
}

const COLS = `a.id, a.slug, a.name_ml, a.name_en, a.type, a.phone, a.whatsapp_number,
  a.district_id, a.coverage_districts, a.is_24hr, a.ambulance_types,
  a.has_oxygen, a.has_ventilator, a.has_cardiac_monitor, a.has_trained_paramedic,
  a.base_fare_inr, a.per_km_fare_inr, di.name_ml AS district_ml, di.name_en AS district_en`;

/**
 * @param {object} o { term, districtId, type }
 * @returns {Promise<Array>} ALL matching providers (no pagination — emergency use)
 */
async function searchAmbulance(o = {}) {
  const where = ['a.deleted_at IS NULL', "a.verification_status = 'verified'"];
  const values = [];
  if (o.districtId) { values.push(o.districtId); where.push(`a.district_id = $${values.length}`); }
  if (o.type && AMBULANCE_TYPES.includes(o.type)) {
    values.push([o.type]); where.push(`a.ambulance_types @> $${values.length}::text[]`);
  }
  if (o.term) {
    values.push(`%${o.term}%`);
    where.push(`(a.name_en ILIKE $${values.length} OR a.name_ml ILIKE $${values.length})`);
  }
  return run(
    `SELECT ${COLS} FROM ambulance_providers a
       LEFT JOIN districts di ON di.id = a.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY (a.type = 'government') DESC, a.is_24hr DESC, a.name_en`, values);
}

async function getAmbulanceBySlug(slug) {
  const rows = await run(
    `SELECT a.*, di.name_ml AS district_ml, di.name_en AS district_en
       FROM ambulance_providers a
       LEFT JOIN districts di ON di.id = a.district_id
      WHERE a.slug = $1 AND a.deleted_at IS NULL AND a.verification_status = 'verified'`, [slug]);
  return rows[0] || null;
}

async function nearbyAmbulance(districtId, excludeId, limit = 3) {
  if (!districtId) return [];
  return run(
    `SELECT ${COLS} FROM ambulance_providers a
       LEFT JOIN districts di ON di.id = a.district_id
      WHERE a.deleted_at IS NULL AND a.verification_status = 'verified'
        AND a.district_id = $1 AND a.id <> $2
      ORDER BY a.is_24hr DESC, a.name_en LIMIT $3`, [districtId, excludeId, limit]);
}

async function allAmbulanceSlugs() {
  return run(`SELECT slug FROM ambulance_providers WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
}

export { searchAmbulance, getAmbulanceBySlug, nearbyAmbulance, allAmbulanceSlugs, AMBULANCE_TYPES };
