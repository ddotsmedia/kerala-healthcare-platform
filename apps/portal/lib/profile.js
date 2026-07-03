// profile.js — doctor self-service profile data access (the directory WRITE PATH).
// On every profile write, the search_ml / search_manglish tsvectors are
// repopulated via @khp/search, in the same transaction. Parameterised SQL only.
//
// Auth: the authenticated doctor is resolved from the JWT session (@khp/auth);
// their doctors.id is looked up via doctors.user_id. A doctor may only act on
// their own row.

import { getPool } from '@khp/db';
import { doctorVectorUpdate } from '@khp/search';
import { delByPrefix } from '@khp/cache';
import { getSession } from './session.js';

/** @returns {Promise<string|null>} the current doctor's id, or null if not a doctor. */
async function currentDoctorId() {
  const s = getSession();
  if (!s || s.role !== 'doctor') return null;
  const { rows } = await getPool().query(
    `SELECT id FROM doctors WHERE user_id = $1 AND deleted_at IS NULL LIMIT 1`, [s.userId]
  );
  return rows[0] ? rows[0].id : null;
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

    // Detect changes to KEY fields (name, registration_number). Per spec, these
    // reset verification to 'pending' and unpublish until re-verified.
    const cur = (await client.query(
      `SELECT name_en, name_ml, nmc_registration_no FROM doctors WHERE id = $1`,
      [id]
    )).rows[0] || {};
    const newName = fields.name_en || cur.name_en;
    const newReg = fields.registration_number || cur.nmc_registration_no;
    const keyChanged =
      (fields.name_en != null && fields.name_en !== cur.name_en) ||
      (fields.name_ml != null && fields.name_ml !== cur.name_ml) ||
      (fields.registration_number != null && fields.registration_number !== cur.nmc_registration_no);

    await client.query(
      `UPDATE doctors
          SET about_ml = $1, about_en = $2, bio_ml = $1, bio_en = $2, photo_url = $3,
              years_experience = $4, consultation_fee = $5, languages = $6,
              name_en = COALESCE($7, name_en), name_ml = COALESCE($8, name_ml),
              display_name = COALESCE($7, display_name),
              nmc_registration_no = COALESCE($9, nmc_registration_no),
              verification_status = CASE WHEN $10 THEN 'pending' ELSE verification_status END,
              nmc_verified        = CASE WHEN $10 THEN false ELSE nmc_verified END,
              verified_at         = CASE WHEN $10 THEN NULL ELSE verified_at END,
              listing_status      = CASE WHEN $10 THEN 'draft' ELSE listing_status END,
              updated_at = now()
        WHERE id = $11 AND deleted_at IS NULL`,
      [
        fields.about_ml || null, fields.about_en || null, fields.photo_url || null,
        fields.years_experience, fields.consultation_fee, fields.languages,
        newName, fields.name_ml || null, newReg, keyChanged, id
      ]
    );

    // Repopulate search vectors from the fresh row (write-path wiring).
    const { rows } = await client.query(
      `SELECT d.id, d.display_name, d.about_ml, d.about_en,
              di.name_ml AS district_ml, di.name_en AS district_en,
              s.name_ml AS specialty_ml, s.name_en AS specialty_en
         FROM doctors d
         LEFT JOIN districts di ON di.id = d.district_id
         LEFT JOIN specialties s ON s.id = d.specialty_id
        WHERE d.id = $1`,
      [id]
    );
    if (rows[0]) {
      const upd = doctorVectorUpdate(rows[0]);
      await client.query(upd.text, upd.values);
    }

    await client.query('COMMIT');
    delByPrefix('providers:'); // invalidate provider search cache on profile change
    return { reverified: keyChanged };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Reset verification to pending + unpublish (qualifications change is a key change). */
async function resetVerification(client, id) {
  await client.query(
    `UPDATE doctors
        SET verification_status = 'pending', nmc_verified = false,
            verified_at = NULL, listing_status = 'draft', updated_at = now()
      WHERE id = $1 AND deleted_at IS NULL`,
    [id]
  );
}

/** Append an education entry. Qualifications change → re-verification required. */
async function addEducation(id, edu) {
  if (!id) throw new Error('No doctor id');
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `INSERT INTO provider_education (doctor_id, provider_id, degree, institution_ml, institution_en, year_completed)
       VALUES ($1, $1, $2, $3, $4, $5)`,
      [id, edu.degree, edu.institution_ml || null, edu.institution_en || null, edu.year_completed]
    );
    await resetVerification(client, id);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/** Soft-remove an education entry the doctor owns; qualifications change → re-verify. */
async function deleteEducation(id, eduId) {
  if (!id || !eduId) throw new Error('Missing id');
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE provider_education SET deleted_at = now(), updated_at = now()
        WHERE id = $1 AND doctor_id = $2 AND deleted_at IS NULL`,
      [eduId, id]
    );
    await resetVerification(client, id);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export { currentDoctorId, getMyProfile, updateProfile, addEducation, deleteEducation };
