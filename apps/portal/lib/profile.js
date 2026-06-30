// profile.js — doctor self-service profile data access (the directory WRITE PATH).
// On every profile write, the search_ml / search_manglish tsvectors are
// repopulated via @khp/search, in the same transaction. Parameterised SQL only.
//
// Auth: the authenticated doctor id comes from the session in Phase 2. For now
// it is read from PORTAL_DEMO_DOCTOR_ID. A doctor may only edit their own row.

import { getPool } from '@khp/db';
import { doctorVectorUpdate } from '@khp/search';

/** @returns {string|null} the current doctor's id (Phase 2: from session). */
function currentDoctorId() {
  return process.env.PORTAL_DEMO_DOCTOR_ID || null;
}

/** Load the doctor's own profile + education. */
async function getMyProfile(id) {
  if (!id) return null;
  try {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT d.*, s.name_en AS specialty_en, s.name_ml AS specialty_ml,
              di.name_en AS district_en, di.name_ml AS district_ml
         FROM doctors d
         LEFT JOIN specialties s ON s.id = d.specialty_id
         LEFT JOIN districts di ON di.id = d.district_id
        WHERE d.id = $1 AND d.deleted_at IS NULL`,
      [id]
    );
    const doctor = rows[0];
    if (!doctor) return null;
    const edu = await pool.query(
      `SELECT id, degree, institution_ml, institution_en, year_completed
         FROM provider_education
        WHERE doctor_id = $1 AND deleted_at IS NULL
        ORDER BY year_completed DESC NULLS LAST`,
      [id]
    );
    doctor.education = edu.rows;
    return doctor;
  } catch (err) {
    console.error(`getMyProfile failed: ${err.message}`);
    return null;
  }
}

/**
 * Update editable profile fields, then repopulate the search vectors.
 * Verification/listing status are NOT touched here — a doctor cannot self-verify
 * or self-publish.
 * @param {string} id
 * @param {object} fields { about_ml, about_en, photo_url, years_experience, consultation_fee, languages }
 */
async function updateProfile(id, fields) {
  if (!id) throw new Error('No doctor id');
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE doctors
          SET about_ml = $1, about_en = $2, photo_url = $3,
              years_experience = $4, consultation_fee = $5, languages = $6,
              updated_at = now()
        WHERE id = $7 AND deleted_at IS NULL`,
      [
        fields.about_ml || null,
        fields.about_en || null,
        fields.photo_url || null,
        fields.years_experience,
        fields.consultation_fee,
        fields.languages,
        id
      ]
    );

    // Repopulate search vectors from the fresh row (write-path wiring).
    const { rows } = await client.query(
      `SELECT id, display_name, about_ml, about_en FROM doctors WHERE id = $1`,
      [id]
    );
    if (rows[0]) {
      const upd = doctorVectorUpdate(rows[0]);
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

/** Append an education entry. */
async function addEducation(id, edu) {
  if (!id) throw new Error('No doctor id');
  await getPool().query(
    `INSERT INTO provider_education (doctor_id, degree, institution_ml, institution_en, year_completed)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, edu.degree, edu.institution_ml || null, edu.institution_en || null, edu.year_completed]
  );
}

export { currentDoctorId, getMyProfile, updateProfile, addEducation };
