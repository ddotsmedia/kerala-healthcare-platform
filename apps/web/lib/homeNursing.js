// homeNursing.js — home nursing agency directory data access. Verified only.

import { getPool } from '@khp/db';

const SERVICES = ['general_nursing', 'icu_care', 'post_surgical', 'elderly_care', 'baby_care', 'physiotherapy', 'wound_care', 'palliative'];
const QUALIFICATIONS = ['GNM', 'BSc', 'ANM', 'trained_attendant'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`home-nursing query failed: ${err.message}`); return []; }
}

const COLS = `a.id, a.slug, a.name_ml, a.name_en, a.district_id, a.coverage_districts, a.services,
  a.nurse_qualification, a.has_male_nurses, a.has_female_nurses, a.minimum_booking_hours,
  a.hourly_rate_inr, a.daily_rate_inr, a.monthly_rate_inr, a.is_registered,
  a.rating_avg, a.rating_count, a.phone, di.name_ml AS district_ml, di.name_en AS district_en`;

/**
 * @param {object} o { term, districtId, service, gender, qualification, page, limit }
 */
async function searchHomeNursing(o = {}) {
  const where = ['a.deleted_at IS NULL', "a.verification_status = 'verified'"];
  const values = [];
  if (o.districtId) { values.push(o.districtId); where.push(`a.district_id = $${values.length}`); }
  if (o.gender === 'male') where.push('a.has_male_nurses = true');
  if (o.gender === 'female') where.push('a.has_female_nurses = true');
  if (o.qualification && QUALIFICATIONS.includes(o.qualification)) {
    values.push(o.qualification); where.push(`a.nurse_qualification = $${values.length}`);
  }
  if (o.service && SERVICES.includes(o.service)) {
    values.push([o.service]); where.push(`a.services @> $${values.length}::text[]`);
  }
  if (o.term) {
    values.push(`%${o.term}%`);
    where.push(`(a.name_en ILIKE $${values.length} OR a.name_ml ILIKE $${values.length})`);
  }
  const limit = Math.min(50, Math.max(1, parseInt(o.limit, 10) || 20));
  const offset = (Math.max(1, parseInt(o.page, 10) || 1) - 1) * limit;
  values.push(limit); const li = values.length;
  values.push(offset); const oi = values.length;
  return run(
    `SELECT ${COLS} FROM home_nursing_agencies a
       LEFT JOIN districts di ON di.id = a.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY a.is_registered DESC, a.rating_avg DESC, a.name_en
      LIMIT $${li} OFFSET $${oi}`, values);
}

async function getHomeNursingBySlug(slug) {
  const rows = await run(
    `SELECT a.*, di.name_ml AS district_ml, di.name_en AS district_en
       FROM home_nursing_agencies a
       LEFT JOIN districts di ON di.id = a.district_id
      WHERE a.slug = $1 AND a.deleted_at IS NULL AND a.verification_status = 'verified'`, [slug]);
  return rows[0] || null;
}

async function nearbyHomeNursing(districtId, excludeId, limit = 3) {
  if (!districtId) return [];
  return run(
    `SELECT ${COLS} FROM home_nursing_agencies a
       LEFT JOIN districts di ON di.id = a.district_id
      WHERE a.deleted_at IS NULL AND a.verification_status = 'verified'
        AND a.district_id = $1 AND a.id <> $2
      ORDER BY a.is_registered DESC, a.rating_avg DESC LIMIT $3`, [districtId, excludeId, limit]);
}

async function allHomeNursingSlugs() {
  return run(`SELECT slug FROM home_nursing_agencies WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
}

export { searchHomeNursing, getHomeNursingBySlug, nearbyHomeNursing, allHomeNursingSlugs, SERVICES, QUALIFICATIONS };
