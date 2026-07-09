// dental.js — dental-clinic directory data access. Verified only. Fails soft.

import { getPool } from '@khp/db';

const TREATMENTS = ['cleaning', 'filling', 'root_canal', 'implant', 'braces', 'whitening', 'extraction', 'pediatric', 'orthodontics'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`dental query failed: ${err.message}`); return []; }
}

const COLS = `c.id, c.slug, c.name_ml, c.name_en, c.district_id, c.treatments_offered,
  c.has_digital_xray, c.has_rct, c.has_implants, c.has_orthodontics, c.has_pediatric_dental,
  c.consultation_fee_inr, c.rating_avg, c.rating_count, c.phone,
  di.name_ml AS district_ml, di.name_en AS district_en`;

/**
 * @param {object} o { term, districtId, treatment, hasImplants, hasOrthodontics, hasPediatric, page, limit }
 */
async function searchDental(o = {}) {
  const where = ['c.deleted_at IS NULL', "c.verification_status = 'verified'"];
  const values = [];
  if (o.districtId) { values.push(o.districtId); where.push(`c.district_id = $${values.length}`); }
  const on = (v) => v === true || v === '1' || v === 'true';
  if (on(o.hasImplants)) where.push('c.has_implants = true');
  if (on(o.hasOrthodontics)) where.push('c.has_orthodontics = true');
  if (on(o.hasPediatric)) where.push('c.has_pediatric_dental = true');
  if (o.treatment && TREATMENTS.includes(o.treatment)) {
    values.push([o.treatment]); where.push(`c.treatments_offered @> $${values.length}::text[]`);
  }
  if (o.term) {
    values.push(`%${o.term}%`);
    where.push(`(c.name_en ILIKE $${values.length} OR c.name_ml ILIKE $${values.length})`);
  }
  const limit = Math.min(50, Math.max(1, parseInt(o.limit, 10) || 20));
  const offset = (Math.max(1, parseInt(o.page, 10) || 1) - 1) * limit;
  values.push(limit); const li = values.length;
  values.push(offset); const oi = values.length;
  return run(
    `SELECT ${COLS} FROM dental_clinics c
       LEFT JOIN districts di ON di.id = c.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY c.rating_avg DESC, c.rating_count DESC, c.name_en
      LIMIT $${li} OFFSET $${oi}`, values);
}

async function getDentalBySlug(slug) {
  const rows = await run(
    `SELECT c.*, di.name_ml AS district_ml, di.name_en AS district_en
       FROM dental_clinics c
       LEFT JOIN districts di ON di.id = c.district_id
      WHERE c.slug = $1 AND c.deleted_at IS NULL AND c.verification_status = 'verified'`, [slug]);
  return rows[0] || null;
}

async function nearbyDental(districtId, excludeId, limit = 3) {
  if (!districtId) return [];
  return run(
    `SELECT ${COLS} FROM dental_clinics c
       LEFT JOIN districts di ON di.id = c.district_id
      WHERE c.deleted_at IS NULL AND c.verification_status = 'verified'
        AND c.district_id = $1 AND c.id <> $2
      ORDER BY c.rating_avg DESC LIMIT $3`, [districtId, excludeId, limit]);
}

async function allDentalSlugs() {
  return run(`SELECT slug FROM dental_clinics WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
}

export { searchDental, getDentalBySlug, nearbyDental, allDentalSlugs, TREATMENTS };
