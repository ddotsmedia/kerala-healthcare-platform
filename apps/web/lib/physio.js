// physio.js — physiotherapy centre directory data access. Verified only.

import { getPool } from '@khp/db';

const SPECIALISATIONS = ['ortho', 'neuro', 'cardio', 'paediatric', 'sports', 'geriatric'];
const EQUIPMENT = ['ultrasound', 'traction', 'tens', 'laser', 'hydrotherapy'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`physio query failed: ${err.message}`); return []; }
}

const COLS = `p.id, p.slug, p.name_ml, p.name_en, p.district_id, p.specialisations, p.equipment,
  p.has_home_visit, p.home_visit_districts, p.consultation_fee_inr, p.session_fee_inr,
  p.rating_avg, p.rating_count, p.phone, di.name_ml AS district_ml, di.name_en AS district_en`;

/**
 * @param {object} o { term, districtId, specialisation, hasHomeVisit, page, limit }
 */
async function searchPhysio(o = {}) {
  const where = ['p.deleted_at IS NULL', "p.verification_status = 'verified'"];
  const values = [];
  if (o.districtId) { values.push(o.districtId); where.push(`p.district_id = $${values.length}`); }
  if (o.hasHomeVisit === true || o.hasHomeVisit === '1' || o.hasHomeVisit === 'true') where.push('p.has_home_visit = true');
  if (o.specialisation && SPECIALISATIONS.includes(o.specialisation)) {
    values.push([o.specialisation]); where.push(`p.specialisations @> $${values.length}::text[]`);
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
    `SELECT ${COLS} FROM physio_centres p
       LEFT JOIN districts di ON di.id = p.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY p.rating_avg DESC, p.rating_count DESC, p.name_en
      LIMIT $${li} OFFSET $${oi}`, values);
}

async function getPhysioBySlug(slug) {
  const rows = await run(
    `SELECT p.*, di.name_ml AS district_ml, di.name_en AS district_en
       FROM physio_centres p
       LEFT JOIN districts di ON di.id = p.district_id
      WHERE p.slug = $1 AND p.deleted_at IS NULL AND p.verification_status = 'verified'`, [slug]);
  return rows[0] || null;
}

async function nearbyPhysio(districtId, excludeId, limit = 3) {
  if (!districtId) return [];
  return run(
    `SELECT ${COLS} FROM physio_centres p
       LEFT JOIN districts di ON di.id = p.district_id
      WHERE p.deleted_at IS NULL AND p.verification_status = 'verified'
        AND p.district_id = $1 AND p.id <> $2
      ORDER BY p.rating_avg DESC LIMIT $3`, [districtId, excludeId, limit]);
}

async function allPhysioSlugs() {
  return run(`SELECT slug FROM physio_centres WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
}

export { searchPhysio, getPhysioBySlug, nearbyPhysio, allPhysioSlugs, SPECIALISATIONS, EQUIPMENT };
