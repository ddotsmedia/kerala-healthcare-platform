// landing.js — data access for specialty/district SEO landing pages.
// Parameterised SQL only. Verified + published rows. Fails soft (0/[]/null).

import { getPool } from '@khp/db';
import { cached, TTL } from '@khp/cache';

const PUB = "listing_status = 'published' AND verification_status = 'verified' AND deleted_at IS NULL";
// d.-qualified variant for queries that join another table with a deleted_at column.
const PUB_D = "d.listing_status = 'published' AND d.verification_status = 'verified' AND d.deleted_at IS NULL";

async function run(text, values = []) {
  try {
    const { rows } = await getPool().query(text, values);
    return rows;
  } catch (err) {
    console.error(`landing query failed: ${err.message}`);
    return [];
  }
}
const one = async (t, v) => (await run(t, v))[0] || null;
const num = async (t, v) => (await run(t, v))[0]?.n ?? 0;

/** Readable district slug from its English name (no slug column exists). */
export function districtSlug(nameEn = '') {
  return String(nameEn).toLowerCase().trim().replace(/\s+/g, '-');
}

export function getSpecialtyBySlug(slug) {
  return cached(`landing:sp:${slug}`, TTL.providers, () =>
    one(`SELECT id, slug, name_ml, name_en FROM specialties WHERE slug = $1 AND deleted_at IS NULL`, [slug]));
}

export function getDistrictBySlug(slug) {
  return cached(`landing:di:${slug}`, TTL.providers, () =>
    one(`SELECT id, code, name_ml, name_en FROM districts
          WHERE lower(name_en) = lower($1) AND deleted_at IS NULL`, [slug]));
}

export function countDoctors({ specialtyId, districtId } = {}) {
  const where = [PUB]; const values = [];
  if (specialtyId) { values.push(specialtyId); where.push(`specialty_id = $${values.length}`); }
  if (districtId) { values.push(districtId); where.push(`district_id = $${values.length}`); }
  return cached(`landing:cd:${specialtyId || ''}:${districtId || ''}`, TTL.providers, () =>
    num(`SELECT count(*)::int AS n FROM doctors WHERE ${where.join(' AND ')}`, values));
}

export function countHospitals({ districtId } = {}) {
  const where = [PUB]; const values = [];
  if (districtId) { values.push(districtId); where.push(`district_id = $${values.length}`); }
  return cached(`landing:ch:${districtId || ''}`, TTL.providers, () =>
    num(`SELECT count(*)::int AS n FROM hospitals WHERE ${where.join(' AND ')}`, values));
}

/** Distinct districts that have >=1 doctor in this specialty. */
export function districtsCovered(specialtyId) {
  return cached(`landing:dcov:${specialtyId}`, TTL.providers, () =>
    num(`SELECT count(DISTINCT district_id)::int AS n FROM doctors
          WHERE ${PUB} AND specialty_id = $1 AND district_id IS NOT NULL`, [specialtyId]));
}

/** Distinct specialties present in this district. */
export function specialtiesInDistrict(districtId) {
  return cached(`landing:sind:${districtId}`, TTL.providers, () =>
    num(`SELECT count(DISTINCT specialty_id)::int AS n FROM doctors
          WHERE ${PUB} AND district_id = $1 AND specialty_id IS NOT NULL`, [districtId]));
}

/** Fee range for a specialty. @returns {{min:number|null,max:number|null}} */
export async function feeRange(specialtyId) {
  return cached(`landing:fee:${specialtyId}`, TTL.providers, async () => {
    const r = await one(
      `SELECT min(consultation_fee)::int AS min, max(consultation_fee)::int AS max
         FROM doctors WHERE ${PUB} AND specialty_id = $1 AND consultation_fee IS NOT NULL`, [specialtyId]);
    return { min: r?.min ?? null, max: r?.max ?? null };
  });
}

/** Specialties present in a district, with per-specialty doctor counts (desc). */
export function specialtyCountsInDistrict(districtId) {
  return cached(`landing:scind:${districtId}`, TTL.providers, () =>
    run(`SELECT s.id, s.slug, s.name_ml, s.name_en, count(d.*)::int AS count
           FROM specialties s
           JOIN doctors d ON d.specialty_id = s.id AND ${PUB_D}
          WHERE d.district_id = $1 AND s.deleted_at IS NULL
          GROUP BY s.id, s.slug, s.name_ml, s.name_en
          ORDER BY count DESC`, [districtId]));
}

/** All specialties with doctor counts (zero included) — index page. */
export function specialtyCountsAll() {
  return cached('landing:scall', TTL.providers, () =>
    run(`SELECT s.id, s.slug, s.name_ml, s.name_en,
                count(d.*) FILTER (WHERE ${PUB_D})::int AS count
           FROM specialties s
           LEFT JOIN doctors d ON d.specialty_id = s.id
          WHERE s.deleted_at IS NULL
          GROUP BY s.id, s.slug, s.name_ml, s.name_en
          ORDER BY s.name_en`));
}

/** All districts with doctor counts (zero included) — index page. */
export function districtCountsAll() {
  return cached('landing:dcall', TTL.providers, () =>
    run(`SELECT di.id, di.code, di.name_ml, di.name_en,
                count(d.*) FILTER (WHERE ${PUB_D})::int AS count
           FROM districts di
           LEFT JOIN doctors d ON d.district_id = di.id
          WHERE di.deleted_at IS NULL
          GROUP BY di.id, di.code, di.name_ml, di.name_en
          ORDER BY di.name_en`));
}

/** District+specialty pairs that have >=1 doctor — combo pages + sitemap. */
export function combosWithDoctors() {
  return cached('landing:combos', TTL.providers, () =>
    run(`SELECT DISTINCT s.slug AS specialty_slug, di.name_en AS district_name
           FROM doctors d
           JOIN specialties s ON s.id = d.specialty_id
           JOIN districts di ON di.id = d.district_id
          WHERE ${PUB_D}`));
}

/** Slugs for sitemap. */
export function allDoctorSlugs() {
  return cached('landing:docslugs', TTL.providers, () =>
    run(`SELECT slug FROM doctors WHERE ${PUB} ORDER BY published_at DESC NULLS LAST`));
}
export function allHospitalSlugs() {
  return cached('landing:hospslugs', TTL.providers, () =>
    run(`SELECT slug FROM hospitals WHERE ${PUB} ORDER BY published_at DESC NULLS LAST`));
}
