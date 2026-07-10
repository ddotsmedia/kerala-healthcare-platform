// equipment.js — medical equipment supplier directory data access. Verified only.

import { getPool } from '@khp/db';

const CATEGORIES = ['mobility', 'respiratory', 'monitoring', 'rehabilitation', 'hospital_furniture', 'orthotics', 'prosthetics'];
const TYPES = ['supplier', 'rental', 'repair'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`equipment query failed: ${err.message}`); return []; }
}

const COLS = `e.id, e.slug, e.name_ml, e.name_en, e.type, e.district_id, e.equipment_categories,
  e.has_rental, e.has_delivery, e.has_installation, e.has_repair_service, e.phone,
  di.name_ml AS district_ml, di.name_en AS district_en`;

/**
 * @param {object} o { term, districtId, type, category, hasRental, page, limit }
 */
async function searchEquipment(o = {}) {
  const where = ['e.deleted_at IS NULL', "e.verification_status = 'verified'"];
  const values = [];
  if (o.districtId) { values.push(o.districtId); where.push(`e.district_id = $${values.length}`); }
  if (o.type && TYPES.includes(o.type)) { values.push(o.type); where.push(`e.type = $${values.length}`); }
  if (o.hasRental === true || o.hasRental === '1' || o.hasRental === 'true') where.push('e.has_rental = true');
  if (o.category && CATEGORIES.includes(o.category)) {
    values.push([o.category]); where.push(`e.equipment_categories @> $${values.length}::text[]`);
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
    `SELECT ${COLS} FROM medical_equipment_suppliers e
       LEFT JOIN districts di ON di.id = e.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY e.has_rental DESC, e.name_en
      LIMIT $${li} OFFSET $${oi}`, values);
}

async function getEquipmentBySlug(slug) {
  const rows = await run(
    `SELECT e.*, di.name_ml AS district_ml, di.name_en AS district_en
       FROM medical_equipment_suppliers e
       LEFT JOIN districts di ON di.id = e.district_id
      WHERE e.slug = $1 AND e.deleted_at IS NULL AND e.verification_status = 'verified'`, [slug]);
  return rows[0] || null;
}

async function nearbyEquipment(districtId, excludeId, limit = 3) {
  if (!districtId) return [];
  return run(
    `SELECT ${COLS} FROM medical_equipment_suppliers e
       LEFT JOIN districts di ON di.id = e.district_id
      WHERE e.deleted_at IS NULL AND e.verification_status = 'verified'
        AND e.district_id = $1 AND e.id <> $2
      ORDER BY e.name_en LIMIT $3`, [districtId, excludeId, limit]);
}

async function allEquipmentSlugs() {
  return run(`SELECT slug FROM medical_equipment_suppliers WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
}

export { searchEquipment, getEquipmentBySlug, nearbyEquipment, allEquipmentSlugs, CATEGORIES, TYPES };
