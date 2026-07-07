// pharmacies.js — pharmacy directory data access. Verified + not-deleted only.
// Parameterised SQL; fails soft. Open-now reuses the labs Asia/Kolkata helper;
// a 24hr pharmacy is always open.

import { getPool } from '@khp/db';
import { isLabOpenNow } from './labs.js';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`pharmacies query failed: ${err.message}`); return []; }
}

function isPharmacyOpenNow(p) {
  if (p.is_24hr) return true;
  return isLabOpenNow(p.operating_hours);
}

const COLS = `p.id, p.slug, p.name_ml, p.name_en, p.type, p.district_id,
  p.is_24hr, p.has_delivery, p.delivery_radius_km, p.sells_generic, p.has_cold_storage,
  p.operating_hours, p.rating_avg, p.rating_count, p.phone,
  di.name_ml AS district_ml, di.name_en AS district_en`;

/**
 * @param {object} o { term, districtId, is24hr, hasDelivery, sellsGeneric, openNow, page, limit }
 */
async function searchPharmacies(o = {}) {
  const where = ['p.deleted_at IS NULL', "p.verification_status = 'verified'"];
  const values = [];
  if (o.districtId) { values.push(o.districtId); where.push(`p.district_id = $${values.length}`); }
  const on = (v) => v === true || v === '1' || v === 'true';
  if (on(o.is24hr)) where.push('p.is_24hr = true');
  if (on(o.hasDelivery)) where.push('p.has_delivery = true');
  if (on(o.sellsGeneric)) where.push('p.sells_generic = true');
  if (o.term) {
    values.push(`%${o.term}%`);
    where.push(`(p.name_en ILIKE $${values.length} OR p.name_ml ILIKE $${values.length})`);
  }
  const limit = Math.min(50, Math.max(1, parseInt(o.limit, 10) || 20));
  const offset = (Math.max(1, parseInt(o.page, 10) || 1) - 1) * limit;
  values.push(limit); const li = values.length;
  values.push(offset); const oi = values.length;
  const rows = await run(
    `SELECT ${COLS} FROM pharmacies p
       LEFT JOIN districts di ON di.id = p.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY p.is_24hr DESC, p.rating_avg DESC, p.name_en
      LIMIT $${li} OFFSET $${oi}`, values);
  const withOpen = rows.map((r) => ({ ...r, open_now: isPharmacyOpenNow(r) }));
  if (on(o.openNow)) return withOpen.filter((r) => r.open_now === true);
  return withOpen;
}

async function getPharmacyBySlug(slug) {
  const rows = await run(
    `SELECT p.*, di.name_ml AS district_ml, di.name_en AS district_en
       FROM pharmacies p
       LEFT JOIN districts di ON di.id = p.district_id
      WHERE p.slug = $1 AND p.deleted_at IS NULL AND p.verification_status = 'verified'`, [slug]);
  const ph = rows[0];
  if (!ph) return null;
  ph.open_now = isPharmacyOpenNow(ph);
  return ph;
}

async function nearbyPharmacies(districtId, excludeId, limit = 3) {
  if (!districtId) return [];
  return run(
    `SELECT ${COLS} FROM pharmacies p
       LEFT JOIN districts di ON di.id = p.district_id
      WHERE p.deleted_at IS NULL AND p.verification_status = 'verified'
        AND p.district_id = $1 AND p.id <> $2
      ORDER BY p.is_24hr DESC, p.rating_avg DESC LIMIT $3`, [districtId, excludeId, limit]);
}

async function allPharmacySlugs() {
  return run(`SELECT slug FROM pharmacies WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
}

export { searchPharmacies, getPharmacyBySlug, nearbyPharmacies, allPharmacySlugs, isPharmacyOpenNow };
