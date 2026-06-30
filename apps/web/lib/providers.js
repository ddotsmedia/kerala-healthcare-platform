// providers.js — server-side directory data access.
// Uses the shared pg pool and the search query builders. Parameterised SQL only.
// All reads are limited to verified + published rows. Fails soft (returns empty)
// when the database is unavailable, so pages still render.

import { getPool } from '@khp/db';
import { buildDoctorSearch, buildHospitalSearch, searchAll } from '@khp/search';

async function run(query) {
  try {
    const pool = getPool();
    const { rows } = await pool.query(query.text, query.values);
    return rows;
  } catch (err) {
    console.error(`directory query failed: ${err.message}`);
    return [];
  }
}

async function runOne(text, values) {
  const rows = await run({ text, values });
  return rows[0] || null;
}

/** @param {object} opts { term, districtId, specialtyId, page, limit } */
function searchDoctors(opts) {
  return run(buildDoctorSearch(opts));
}

/** @param {object} opts { term, districtId, serviceSlug, department, page, limit } */
function searchHospitals(opts) {
  return run(buildHospitalSearch(opts));
}

/** Unified search across doctors + hospitals. @returns {{doctors, hospitals}} */
async function searchAllProviders(opts) {
  const q = searchAll(opts);
  const [doctors, hospitals] = await Promise.all([run(q.doctors), run(q.hospitals)]);
  return { doctors, hospitals };
}

/** All districts (for filter dropdowns), Malayalam-first ordering. */
function listDistricts() {
  return run({
    text: `SELECT id, code, name_ml, name_en FROM districts WHERE deleted_at IS NULL ORDER BY name_en`,
    values: []
  });
}

/** All specialties (for filter multiselect). */
function listSpecialties() {
  return run({
    text: `SELECT id, slug, name_ml, name_en FROM specialties WHERE deleted_at IS NULL ORDER BY name_en`,
    values: []
  });
}

/** Public doctor profile by permanent slug (verified + published only). */
async function getDoctorBySlug(slug) {
  const doctor = await runOne(
    `SELECT d.*, s.name_ml AS specialty_ml, s.name_en AS specialty_en,
            di.name_ml AS district_ml, di.name_en AS district_en
       FROM doctors d
       LEFT JOIN specialties s ON s.id = d.specialty_id
       LEFT JOIN districts di ON di.id = d.district_id
      WHERE d.slug = $1 AND d.deleted_at IS NULL
        AND d.listing_status = 'published' AND d.verification_status = 'verified'`,
    [slug]
  );
  if (!doctor) return null;
  doctor.education = await run({
    text: `SELECT degree, institution_ml, institution_en, year_completed
             FROM provider_education
            WHERE doctor_id = $1 AND deleted_at IS NULL
            ORDER BY year_completed DESC NULLS LAST`,
    values: [doctor.id]
  });
  return doctor;
}

/** Public hospital profile by permanent slug (verified + published only). */
async function getHospitalBySlug(slug) {
  const hospital = await runOne(
    `SELECT h.*, di.name_ml AS district_ml, di.name_en AS district_en
       FROM hospitals h
       LEFT JOIN districts di ON di.id = h.district_id
      WHERE h.slug = $1 AND h.deleted_at IS NULL
        AND h.listing_status = 'published' AND h.verification_status = 'verified'`,
    [slug]
  );
  if (!hospital) return null;
  const id = hospital.id;
  hospital.departments = await run({
    text: `SELECT name_ml, name_en FROM hospital_departments WHERE hospital_id = $1 AND deleted_at IS NULL`,
    values: [id]
  });
  hospital.services = await run({
    text: `SELECT name_ml, name_en, available_24x7 FROM hospital_services WHERE hospital_id = $1 AND deleted_at IS NULL`,
    values: [id]
  });
  hospital.accreditations = await run({
    text: `SELECT body, accreditation_no, valid_until FROM hospital_accreditations WHERE hospital_id = $1 AND verified = true AND deleted_at IS NULL`,
    values: [id]
  });
  return hospital;
}

export {
  searchDoctors, searchHospitals, searchAllProviders,
  listDistricts, listSpecialties, getDoctorBySlug, getHospitalBySlug
};
