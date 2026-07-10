// fertility.js — IVF/IUI fertility centre directory data access. Verified only.

import { getPool } from '@khp/db';

const TREATMENTS = ['ivf', 'iui', 'icsi', 'egg_freezing', 'embryo_freezing', 'donor_egg', 'surrogacy_consultation', 'male_infertility', 'sperm_bank'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`fertility query failed: ${err.message}`); return []; }
}

const COLS = `f.id, f.slug, f.name_ml, f.name_en, f.district_id, f.treatments,
  f.has_sperm_bank, f.has_egg_donation, f.ivf_success_rate_percent, f.established_year,
  f.consultation_fee_inr, f.rating_avg, f.rating_count, f.phone,
  di.name_ml AS district_ml, di.name_en AS district_en`;

/**
 * @param {object} o { term, districtId, treatment, hasSpermBank, hasEggDonation, page, limit }
 */
async function searchFertility(o = {}) {
  const where = ['f.deleted_at IS NULL', "f.verification_status = 'verified'"];
  const values = [];
  if (o.districtId) { values.push(o.districtId); where.push(`f.district_id = $${values.length}`); }
  const on = (v) => v === true || v === '1' || v === 'true';
  if (on(o.hasSpermBank)) where.push('f.has_sperm_bank = true');
  if (on(o.hasEggDonation)) where.push('f.has_egg_donation = true');
  if (o.treatment && TREATMENTS.includes(o.treatment)) {
    values.push([o.treatment]); where.push(`f.treatments @> $${values.length}::text[]`);
  }
  if (o.term) {
    values.push(`%${o.term}%`);
    where.push(`(f.name_en ILIKE $${values.length} OR f.name_ml ILIKE $${values.length})`);
  }
  const limit = Math.min(50, Math.max(1, parseInt(o.limit, 10) || 20));
  const offset = (Math.max(1, parseInt(o.page, 10) || 1) - 1) * limit;
  values.push(limit); const li = values.length;
  values.push(offset); const oi = values.length;
  return run(
    `SELECT ${COLS} FROM fertility_centres f
       LEFT JOIN districts di ON di.id = f.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY f.rating_avg DESC, f.rating_count DESC, f.name_en
      LIMIT $${li} OFFSET $${oi}`, values);
}

async function getFertilityBySlug(slug) {
  const rows = await run(
    `SELECT f.*, di.name_ml AS district_ml, di.name_en AS district_en
       FROM fertility_centres f
       LEFT JOIN districts di ON di.id = f.district_id
      WHERE f.slug = $1 AND f.deleted_at IS NULL AND f.verification_status = 'verified'`, [slug]);
  return rows[0] || null;
}

async function nearbyFertility(districtId, excludeId, limit = 3) {
  if (!districtId) return [];
  return run(
    `SELECT ${COLS} FROM fertility_centres f
       LEFT JOIN districts di ON di.id = f.district_id
      WHERE f.deleted_at IS NULL AND f.verification_status = 'verified'
        AND f.district_id = $1 AND f.id <> $2
      ORDER BY f.rating_avg DESC LIMIT $3`, [districtId, excludeId, limit]);
}

async function allFertilitySlugs() {
  return run(`SELECT slug FROM fertility_centres WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
}

export { searchFertility, getFertilityBySlug, nearbyFertility, allFertilitySlugs, TREATMENTS };
