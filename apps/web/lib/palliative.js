// palliative.js — palliative-care centre directory data access. Verified only.

import { getPool } from '@khp/db';

const TYPES = ['hospital_unit', 'standalone', 'home_care', 'ngo', 'hospice'];
const SERVICES = ['pain_management', 'counselling', 'nursing', 'physiotherapy', 'spiritual_care', 'bereavement'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`palliative query failed: ${err.message}`); return []; }
}

const COLS = `p.id, p.slug, p.name_ml, p.name_en, p.type, p.district_id, p.coverage_districts,
  p.has_home_visits, p.has_inpatient, p.inpatient_beds, p.services, p.is_free_of_cost,
  p.accepts_donations, p.phone, di.name_ml AS district_ml, di.name_en AS district_en`;

/**
 * @param {object} o { term, districtId, type, service, hasHomeVisits, page, limit }
 */
async function searchPalliative(o = {}) {
  const where = ['p.deleted_at IS NULL', "p.verification_status = 'verified'"];
  const values = [];
  if (o.districtId) { values.push(o.districtId); where.push(`p.district_id = $${values.length}`); }
  if (o.type && TYPES.includes(o.type)) { values.push(o.type); where.push(`p.type = $${values.length}`); }
  if (o.hasHomeVisits === true || o.hasHomeVisits === '1' || o.hasHomeVisits === 'true') where.push('p.has_home_visits = true');
  if (o.service && SERVICES.includes(o.service)) {
    values.push([o.service]); where.push(`p.services @> $${values.length}::text[]`);
  }
  if (o.term) {
    values.push(`%${o.term}%`);
    where.push(`(p.name_en ILIKE $${values.length} OR p.name_ml ILIKE $${values.length})`);
  }
  const limit = Math.min(50, Math.max(1, parseInt(o.limit, 10) || 20));
  const offset = (Math.max(1, parseInt(o.page, 10) || 1) - 1) * limit;
  values.push(limit); const li = values.length;
  values.push(offset); const oi = values.length;
  return run(
    `SELECT ${COLS} FROM palliative_centres p
       LEFT JOIN districts di ON di.id = p.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY p.is_free_of_cost DESC, p.has_home_visits DESC, p.name_en
      LIMIT $${li} OFFSET $${oi}`, values);
}

async function getPalliativeBySlug(slug) {
  const rows = await run(
    `SELECT p.*, di.name_ml AS district_ml, di.name_en AS district_en
       FROM palliative_centres p
       LEFT JOIN districts di ON di.id = p.district_id
      WHERE p.slug = $1 AND p.deleted_at IS NULL AND p.verification_status = 'verified'`, [slug]);
  return rows[0] || null;
}

async function nearbyPalliative(districtId, excludeId, limit = 3) {
  if (!districtId) return [];
  return run(
    `SELECT ${COLS} FROM palliative_centres p
       LEFT JOIN districts di ON di.id = p.district_id
      WHERE p.deleted_at IS NULL AND p.verification_status = 'verified'
        AND p.district_id = $1 AND p.id <> $2
      ORDER BY p.is_free_of_cost DESC, p.name_en LIMIT $3`, [districtId, excludeId, limit]);
}

async function allPalliativeSlugs() {
  return run(`SELECT slug FROM palliative_centres WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
}

export { searchPalliative, getPalliativeBySlug, nearbyPalliative, allPalliativeSlugs, TYPES, SERVICES };
