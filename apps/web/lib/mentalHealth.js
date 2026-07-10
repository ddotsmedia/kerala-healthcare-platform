// mentalHealth.js — mental-health centre directory data access. Verified only.
// Compassionate framing lives in the UI; this layer is plain data access.

import { getPool } from '@khp/db';

const TYPES = ['hospital', 'clinic', 'rehab', 'deaddiction', 'ngo', 'counselling'];
const SERVICES = ['psychiatry', 'psychology', 'counselling', 'deaddiction', 'rehabilitation', 'group_therapy'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`mental-health query failed: ${err.message}`); return []; }
}

const COLS = `m.id, m.slug, m.name_ml, m.name_en, m.type, m.district_id, m.services,
  m.has_inpatient, m.inpatient_beds, m.has_emergency, m.is_govt_approved,
  m.consultation_fee_inr, m.rating_avg, m.rating_count, m.phone, m.emergency_phone,
  di.name_ml AS district_ml, di.name_en AS district_en`;

/**
 * @param {object} o { term, districtId, type, service, hasEmergency, hasInpatient, page, limit }
 */
async function searchMentalHealth(o = {}) {
  const where = ['m.deleted_at IS NULL', "m.verification_status = 'verified'"];
  const values = [];
  if (o.districtId) { values.push(o.districtId); where.push(`m.district_id = $${values.length}`); }
  if (o.type && TYPES.includes(o.type)) { values.push(o.type); where.push(`m.type = $${values.length}`); }
  const on = (v) => v === true || v === '1' || v === 'true';
  if (on(o.hasEmergency)) where.push('m.has_emergency = true');
  if (on(o.hasInpatient)) where.push('m.has_inpatient = true');
  if (o.service && SERVICES.includes(o.service)) {
    values.push([o.service]); where.push(`m.services @> $${values.length}::text[]`);
  }
  if (o.term) {
    values.push(`%${o.term}%`);
    where.push(`(m.name_en ILIKE $${values.length} OR m.name_ml ILIKE $${values.length})`);
  }
  const limit = Math.min(50, Math.max(1, parseInt(o.limit, 10) || 20));
  const offset = (Math.max(1, parseInt(o.page, 10) || 1) - 1) * limit;
  values.push(limit); const li = values.length;
  values.push(offset); const oi = values.length;
  return run(
    `SELECT ${COLS} FROM mental_health_centres m
       LEFT JOIN districts di ON di.id = m.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY m.rating_avg DESC, m.rating_count DESC, m.name_en
      LIMIT $${li} OFFSET $${oi}`, values);
}

async function getMentalHealthBySlug(slug) {
  const rows = await run(
    `SELECT m.*, di.name_ml AS district_ml, di.name_en AS district_en
       FROM mental_health_centres m
       LEFT JOIN districts di ON di.id = m.district_id
      WHERE m.slug = $1 AND m.deleted_at IS NULL AND m.verification_status = 'verified'`, [slug]);
  return rows[0] || null;
}

async function nearbyMentalHealth(districtId, excludeId, limit = 3) {
  if (!districtId) return [];
  return run(
    `SELECT ${COLS} FROM mental_health_centres m
       LEFT JOIN districts di ON di.id = m.district_id
      WHERE m.deleted_at IS NULL AND m.verification_status = 'verified'
        AND m.district_id = $1 AND m.id <> $2
      ORDER BY m.rating_avg DESC LIMIT $3`, [districtId, excludeId, limit]);
}

async function allMentalHealthSlugs() {
  return run(`SELECT slug FROM mental_health_centres WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
}

export { searchMentalHealth, getMentalHealthBySlug, nearbyMentalHealth, allMentalHealthSlugs, TYPES, SERVICES };
