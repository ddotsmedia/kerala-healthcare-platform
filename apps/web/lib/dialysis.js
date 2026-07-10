// dialysis.js — dialysis centre directory data access. Verified only. Fails soft.

import { getPool } from '@khp/db';

const SHIFTS = ['morning', 'afternoon', 'evening', 'night'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`dialysis query failed: ${err.message}`); return []; }
}

const COLS = `c.id, c.slug, c.name_ml, c.name_en, c.district_id, c.machine_count,
  c.sessions_per_week, c.shift_timings, c.has_hd, c.has_pd, c.has_hdf,
  c.accepts_govt_scheme, c.fee_per_session_inr, c.phone,
  di.name_ml AS district_ml, di.name_en AS district_en`;

/**
 * @param {object} o { term, districtId, hasHd, hasPd, acceptsGovt, shift, page, limit }
 */
async function searchDialysis(o = {}) {
  const where = ['c.deleted_at IS NULL', "c.verification_status = 'verified'"];
  const values = [];
  if (o.districtId) { values.push(o.districtId); where.push(`c.district_id = $${values.length}`); }
  const on = (v) => v === true || v === '1' || v === 'true';
  if (on(o.hasHd)) where.push('c.has_hd = true');
  if (on(o.hasPd)) where.push('c.has_pd = true');
  if (on(o.acceptsGovt)) where.push('c.accepts_govt_scheme = true');
  if (o.shift && SHIFTS.includes(o.shift)) {
    values.push(JSON.stringify([{ shift: o.shift }]));
    where.push(`c.shift_timings @> $${values.length}::jsonb`);
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
    `SELECT ${COLS} FROM dialysis_centres c
       LEFT JOIN districts di ON di.id = c.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY c.accepts_govt_scheme DESC, c.machine_count DESC NULLS LAST, c.name_en
      LIMIT $${li} OFFSET $${oi}`, values);
}

async function getDialysisBySlug(slug) {
  const rows = await run(
    `SELECT c.*, di.name_ml AS district_ml, di.name_en AS district_en,
            h.slug AS hospital_slug, h.name_en AS hospital_name_en, h.name_ml AS hospital_name_ml
       FROM dialysis_centres c
       LEFT JOIN districts di ON di.id = c.district_id
       LEFT JOIN hospitals h ON h.id = c.hospital_id
      WHERE c.slug = $1 AND c.deleted_at IS NULL AND c.verification_status = 'verified'`, [slug]);
  return rows[0] || null;
}

async function nearbyDialysis(districtId, excludeId, limit = 3) {
  if (!districtId) return [];
  return run(
    `SELECT ${COLS} FROM dialysis_centres c
       LEFT JOIN districts di ON di.id = c.district_id
      WHERE c.deleted_at IS NULL AND c.verification_status = 'verified'
        AND c.district_id = $1 AND c.id <> $2
      ORDER BY c.accepts_govt_scheme DESC, c.name_en LIMIT $3`, [districtId, excludeId, limit]);
}

async function allDialysisSlugs() {
  return run(`SELECT slug FROM dialysis_centres WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
}

export { searchDialysis, getDialysisBySlug, nearbyDialysis, allDialysisSlugs, SHIFTS };
