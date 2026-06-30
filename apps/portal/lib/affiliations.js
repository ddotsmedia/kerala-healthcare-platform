// affiliations.js — doctor <-> hospital affiliation management (write path for
// hospital_providers). Parameterised SQL only. A doctor manages only their own
// affiliations (id from session in Phase 2; PORTAL_DEMO_DOCTOR_ID stand-in).

import { getPool } from '@khp/db';

/** Current affiliations for a doctor, with hospital names. */
async function listAffiliations(doctorId) {
  if (!doctorId) return [];
  try {
    const { rows } = await getPool().query(
      `SELECT hp.id, hp.role, hp."primary" AS is_primary,
              h.id AS hospital_id, h.name_ml, h.name_en, h.slug
         FROM hospital_providers hp
         JOIN hospitals h ON h.id = hp.hospital_id
        WHERE hp.doctor_id = $1 AND hp.deleted_at IS NULL
        ORDER BY hp."primary" DESC NULLS LAST, h.name_en`,
      [doctorId]
    );
    return rows;
  } catch (err) {
    console.error(`listAffiliations failed: ${err.message}`);
    return [];
  }
}

/** Verified+published hospitals available to affiliate with. */
async function listAffiliableHospitals() {
  try {
    const { rows } = await getPool().query(
      `SELECT id, name_ml, name_en FROM hospitals
        WHERE deleted_at IS NULL AND verification_status = 'verified'
        ORDER BY name_en`
    );
    return rows;
  } catch (err) {
    console.error(`listAffiliableHospitals failed: ${err.message}`);
    return [];
  }
}

/** Add an affiliation (idempotent on hospital+doctor). */
async function addAffiliation(doctorId, hospitalId, role) {
  if (!doctorId || !hospitalId) throw new Error('Missing doctor or hospital id');
  await getPool().query(
    `INSERT INTO hospital_providers (hospital_id, doctor_id, provider_id, role)
     VALUES ($1, $2, $2, $3)
     ON CONFLICT (hospital_id, doctor_id) DO NOTHING`,
    [hospitalId, doctorId, role || null]
  );
}

/** Soft-remove an affiliation the doctor owns. */
async function removeAffiliation(doctorId, affiliationId) {
  if (!doctorId || !affiliationId) throw new Error('Missing id');
  await getPool().query(
    `UPDATE hospital_providers SET deleted_at = now(), updated_at = now()
      WHERE id = $1 AND doctor_id = $2 AND deleted_at IS NULL`,
    [affiliationId, doctorId]
  );
}

export { listAffiliations, listAffiliableHospitals, addAffiliation, removeAffiliation };
