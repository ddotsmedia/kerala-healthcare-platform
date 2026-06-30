// hospital.js — hospital self-service profile data access (directory WRITE PATH).
// Mirrors lib/profile.js. On every write the search_ml/search_manglish tsvectors
// are repopulated via @khp/search in the same transaction. Parameterised SQL only.
//
// Auth: hospital id comes from the session in Phase 2. For now read from
// PORTAL_DEMO_HOSPITAL_ID. A hospital cannot self-verify or self-publish —
// verification_status / listing_status are never written here.

import { getPool } from '@khp/db';
import { hospitalVectorUpdate } from '@khp/search';

/** @returns {string|null} the current hospital's id (Phase 2: from session). */
function currentHospitalId() {
  return process.env.PORTAL_DEMO_HOSPITAL_ID || null;
}

/** Load the hospital's own profile + departments/services/accreditations. */
async function getMyHospital(id) {
  if (!id) return null;
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT h.*, di.name_en AS district_en, di.name_ml AS district_ml
         FROM hospitals h
         LEFT JOIN districts di ON di.id = h.district_id
        WHERE h.id = $1 AND h.deleted_at IS NULL`,
      [id]
    );
    const hospital = rows[0];
    if (!hospital) return null;
    hospital.departments = (await pool.query(
      `SELECT id, name_ml, name_en FROM hospital_departments WHERE hospital_id = $1 AND deleted_at IS NULL`,
      [id]
    )).rows;
    hospital.services = (await pool.query(
      `SELECT id, name_ml, name_en, available_24x7 FROM hospital_services WHERE hospital_id = $1 AND deleted_at IS NULL`,
      [id]
    )).rows;
    hospital.accreditations = (await pool.query(
      `SELECT id, body, accreditation_no, valid_until FROM hospital_accreditations WHERE hospital_id = $1 AND deleted_at IS NULL`,
      [id]
    )).rows;
    return hospital;
  } catch (err) {
    console.error(`getMyHospital failed: ${err.message}`);
    return null;
  }
}

/**
 * Update editable hospital fields, then repopulate the search vectors.
 * Verification/listing status are NOT touched here.
 * @param {string} id
 * @param {object} f { about_ml, about_en, logo_url, bed_count, emergency_24x7, address_ml, address_en, latitude, longitude }
 */
async function updateHospital(id, f) {
  if (!id) throw new Error('No hospital id');
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE hospitals
          SET about_ml = $1, about_en = $2, logo_url = $3, bed_count = $4,
              emergency_24x7 = $5, address_ml = $6, address_en = $7,
              latitude = $8, longitude = $9, updated_at = now()
        WHERE id = $10 AND deleted_at IS NULL`,
      [
        f.about_ml || null, f.about_en || null, f.logo_url || null,
        f.bed_count, f.emergency_24x7, f.address_ml || null, f.address_en || null,
        f.latitude, f.longitude, id
      ]
    );

    // Repopulate search vectors from the fresh row (write-path wiring).
    const { rows } = await client.query(
      `SELECT id, name_ml, name_en, about_ml, about_en FROM hospitals WHERE id = $1`,
      [id]
    );
    if (rows[0]) {
      const upd = hospitalVectorUpdate(rows[0]);
      await client.query(upd.text, upd.values);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Append a department. */
async function addDepartment(id, d) {
  if (!id) throw new Error('No hospital id');
  await getPool().query(
    `INSERT INTO hospital_departments (hospital_id, name_ml, name_en) VALUES ($1, $2, $3)`,
    [id, d.name_ml || d.name_en, d.name_en || d.name_ml]
  );
}

/** Append a service. */
async function addService(id, s) {
  if (!id) throw new Error('No hospital id');
  await getPool().query(
    `INSERT INTO hospital_services (hospital_id, name_ml, name_en, available_24x7) VALUES ($1, $2, $3, $4)`,
    [id, s.name_ml || s.name_en, s.name_en || s.name_ml, !!s.available_24x7]
  );
}

/** Append an accreditation (unverified until the verification team confirms). */
async function addAccreditation(id, a) {
  if (!id) throw new Error('No hospital id');
  await getPool().query(
    `INSERT INTO hospital_accreditations (hospital_id, body, accreditation_no, valid_until)
     VALUES ($1, $2, $3, $4)`,
    [id, a.body, a.accreditation_no || null, a.valid_until || null]
  );
}

export {
  currentHospitalId, getMyHospital, updateHospital,
  addDepartment, addService, addAccreditation
};
