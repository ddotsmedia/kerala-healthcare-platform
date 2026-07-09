// bloodBanks.js — blood bank directory data access. Verified + not-deleted only.
// Emergency-oriented: list returns ALL matches (no pagination). Fails soft.

import { getPool } from '@khp/db';
import { isLabOpenNow } from './labs.js';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`blood-banks query failed: ${err.message}`); return []; }
}

function openNowOf(b) {
  if (b.is_24hr) return true;
  return isLabOpenNow(b.operating_hours);
}

const COLS = `b.id, b.slug, b.name_ml, b.name_en, b.district_id, b.phone, b.emergency_phone,
  b.is_24hr, b.blood_types_available, b.has_apheresis, b.has_component_separation,
  b.operating_hours, di.name_ml AS district_ml, di.name_en AS district_en`;

/**
 * @param {object} o { term, districtId, bloodType, is24hr }
 * @returns {Promise<Array>} ALL matching banks (no pagination — emergency use)
 */
async function searchBloodBanks(o = {}) {
  const where = ['b.deleted_at IS NULL', "b.verification_status = 'verified'"];
  const values = [];
  if (o.districtId) { values.push(o.districtId); where.push(`b.district_id = $${values.length}`); }
  if (o.is24hr === true || o.is24hr === '1' || o.is24hr === 'true') where.push('b.is_24hr = true');
  if (o.bloodType && BLOOD_TYPES.includes(o.bloodType)) {
    values.push([o.bloodType]); where.push(`b.blood_types_available @> $${values.length}::text[]`);
  }
  if (o.term) {
    values.push(`%${o.term}%`);
    where.push(`(b.name_en ILIKE $${values.length} OR b.name_ml ILIKE $${values.length})`);
  }
  const rows = await run(
    `SELECT ${COLS} FROM blood_banks b
       LEFT JOIN districts di ON di.id = b.district_id
      WHERE ${where.join(' AND ')}
      ORDER BY b.is_24hr DESC, b.name_en`, values);
  return rows.map((r) => ({ ...r, open_now: openNowOf(r) }));
}

async function getBloodBankBySlug(slug) {
  const rows = await run(
    `SELECT b.*, di.name_ml AS district_ml, di.name_en AS district_en,
            h.slug AS hospital_slug, h.name_en AS hospital_name_en, h.name_ml AS hospital_name_ml
       FROM blood_banks b
       LEFT JOIN districts di ON di.id = b.district_id
       LEFT JOIN hospitals h ON h.id = b.hospital_id
      WHERE b.slug = $1 AND b.deleted_at IS NULL AND b.verification_status = 'verified'`, [slug]);
  const bank = rows[0];
  if (!bank) return null;
  bank.open_now = openNowOf(bank);
  return bank;
}

async function nearbyBloodBanks(districtId, excludeId, limit = 3) {
  if (!districtId) return [];
  return run(
    `SELECT ${COLS} FROM blood_banks b
       LEFT JOIN districts di ON di.id = b.district_id
      WHERE b.deleted_at IS NULL AND b.verification_status = 'verified'
        AND b.district_id = $1 AND b.id <> $2
      ORDER BY b.is_24hr DESC, b.name_en LIMIT $3`, [districtId, excludeId, limit]);
}

async function allBloodBankSlugs() {
  return run(`SELECT slug FROM blood_banks WHERE deleted_at IS NULL AND verification_status = 'verified'`, []);
}

export { searchBloodBanks, getBloodBankBySlug, nearbyBloodBanks, allBloodBankSlugs, BLOOD_TYPES };
