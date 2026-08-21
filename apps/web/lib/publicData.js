// publicData.js — read-only, privacy-safe queries for the public partner API.
// Only verified/published records; NO encrypted contact fields ever exposed.

import { getPool } from '@khp/db';

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}
const pageArgs = (sp) => {
  const page = Math.max(1, parseInt(sp.get('page'), 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(sp.get('limit'), 10) || 20));
  return { page, limit, offset: (page - 1) * limit };
};

export async function publicDoctors(sp) {
  const { page, limit, offset } = pageArgs(sp);
  const district = sp.get('district') || null;
  const specialty = sp.get('specialty') || null;
  const data = await rows(
    `SELECT d.id, d.slug, d.display_name, d.years_experience, d.consultation_fee,
            d.languages, d.verification_status,
            s.name_en AS specialty, di.name_en AS district
       FROM doctors d
       LEFT JOIN specialties s ON s.id = d.specialty_id
       LEFT JOIN districts di ON di.id = d.district_id
      WHERE d.deleted_at IS NULL AND d.verification_status='verified' AND d.listing_status='published'
        AND ($1::uuid IS NULL OR d.district_id=$1) AND ($2::uuid IS NULL OR d.specialty_id=$2)
      ORDER BY d.display_name LIMIT $3 OFFSET $4`,
    [district, specialty, limit, offset]
  );
  return { data, meta: { page, limit, count: data.length } };
}

export async function publicHospitals(sp) {
  const { page, limit, offset } = pageArgs(sp);
  const district = sp.get('district') || null;
  const data = await rows(
    `SELECT h.id, h.slug, h.name_en, h.name_ml, h.emergency_24x7,
            di.name_en AS district
       FROM hospitals h
       LEFT JOIN districts di ON di.id = h.district_id
      WHERE h.deleted_at IS NULL AND h.listing_status='published'
        AND ($1::uuid IS NULL OR h.district_id=$1)
      ORDER BY h.name_en LIMIT $2 OFFSET $3`,
    [district, limit, offset]
  );
  return { data, meta: { page, limit, count: data.length } };
}

export async function publicSpecialties() {
  const data = await rows(
    `SELECT id, slug, name_en, name_ml FROM specialties WHERE deleted_at IS NULL ORDER BY name_en`
  );
  return { data, meta: { count: data.length } };
}

export async function publicDistricts() {
  const data = await rows(
    `SELECT id, code, name_en, name_ml, name_ta, name_hi FROM districts WHERE deleted_at IS NULL ORDER BY name_en`
  );
  return { data, meta: { count: data.length } };
}

export async function publicDisease(slug) {
  const [row] = await rows(
    `SELECT slug, title_en, title_ml, excerpt_en, excerpt_ml, body_en, body_ml, published_at
       FROM content_items
      WHERE slug=$1 AND deleted_at IS NULL AND status='published'
        AND (type='disease' OR category='disease') LIMIT 1`,
    [slug]
  );
  return row || null;
}
