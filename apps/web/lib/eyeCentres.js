// eyeCentres.js — ophthalmology centre directory data access. Verified only.

import { getPool } from '@khp/db';

const SURGERIES = ['cataract', 'lasik', 'glaucoma', 'retina', 'cornea', 'squint'];
const EQUIPMENT = ['oct', 'slit_lamp', 'field_analyser', 'fundus_camera'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`eye-centres query failed: ${err.message}`); return []; }
}

const COLS = `e.id, e.slug, e.name_ml, e.name_en, e.type, e.district_id, e.surgeries_offered,
  e.equipment, e.has_optical_shop, e.has_low_vision_clinic, e.has_pediatric_ophthalmology,
  e.consultation_fee_inr, e.rating_avg, e.rating_count, e.phone,
  di.name_ml AS district_ml, di.name_en AS district_en`;

/**
 * @param {object} o { term, districtId, type, surgery, hasOptical, hasLowVision, hasPediatric, page, limit }
 */
async function searchEyeCentres(o = {}) {
  const where = ['e.deleted_at IS NULL', "e.verification_status = 'verified'"];
  const values = [];
  if (o.districtId) { values.push(o.districtId); where.push(`e.district_id = $${values.length}`); }
  if (o.type) { values.push(o.type); where.push(`e.type = $${values.length}`); }
  const on = (v) => v === true || v === '1' || v === 'true';
  if (on(o.hasOptical)) where.push('e.has_optical_shop = true');
  if (on(o.hasLowVision)) where.push('e.has_low_vision_clinic = true');
  if (on(o.hasPediatric)) where.push('e.has_pediatric_ophthalmology = true');
  if (o.surgery && SURGERIES.includes(o.surgery)) {
    values.push([o.surgery]); where.push(`e.surgeries_offered @> $${values.length}::text[]`);
  }
  if (o.term) {
    values.push(`%${o.term}%`);
    where.push(`(e.name_en ILIKE $${values.length} OR e.name_ml ILIKE $${values.length})`);
  }
  const limit = Math.min(50, Math.max(1, parseInt(o.limit, 10) || 20));
  const offset = (Math.max(1, parseInt(o.page, 10) || 1) - 1) * limit;
  values.push(limit); const li = values.length;
  values.push(offset); const oi = values.length;
  return run(
    `SELECT ${COLS} FROM eye_centres e
       LEFT JOIN districts di ON di.id = e.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY e.rating_avg DESC, e.rating_count DESC, e.name_en
      LIMIT $${li} OFFSET $${oi}`, values);
}

async function getEyeCentreBySlug(slug) {
  const rows = await run(
    `SELECT e.*, di.name_ml AS district_ml, di.name_en AS district_en
       FROM eye_centres e
       LEFT JOIN districts di ON di.id = e.district_id
      WHERE e.slug = $1 AND e.deleted_at IS NULL AND e.verification_status = 'verified'`, [slug]);
  return rows[0] || null;
}

async function nearbyEyeCentres(districtId, excludeId, limit = 3) {
  if (!districtId) return [];
  return run(
    `SELECT ${COLS} FROM eye_centres e
       LEFT JOIN districts di ON di.id = e.district_id
      WHERE e.deleted_at IS NULL AND e.verification_status = 'verified'
        AND e.district_id = $1 AND e.id <> $2
      ORDER BY e.rating_avg DESC LIMIT $3`, [districtId, excludeId, limit]);
}

async function allEyeCentreSlugs() {
  return run(`SELECT slug FROM eye_centres WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
}

export { searchEyeCentres, getEyeCentreBySlug, nearbyEyeCentres, allEyeCentreSlugs, SURGERIES, EQUIPMENT };
