// opd.js — OPD schedule reads (public). Verified + published joins. Fails soft.

import { getPool } from '@khp/db';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`opd query failed: ${err.message}`); return []; }
}

const ACTIVE_EFFECTIVE = `o.is_active = true
  AND (o.effective_from IS NULL OR o.effective_from <= current_date)
  AND (o.effective_to IS NULL OR o.effective_to >= current_date)`;

/** All OPD schedules at a hospital, with doctor name + specialty. */
async function hospitalOpd(hospitalId) {
  return run(
    `SELECT o.id, o.day_of_week, o.start_time, o.end_time, o.consultation_type,
            o.max_tokens, o.notes_ml, o.notes_en,
            d.slug AS doctor_slug, d.display_name AS doctor_name,
            s.name_ml AS specialty_ml, s.name_en AS specialty_en
       FROM opd_schedules o
       JOIN doctors d ON d.id = o.provider_id
            AND d.listing_status = 'published' AND d.verification_status = 'verified' AND d.deleted_at IS NULL
       LEFT JOIN specialties s ON s.id = d.specialty_id
      WHERE o.hospital_id = $1 AND ${ACTIVE_EFFECTIVE}
      ORDER BY o.start_time`, [hospitalId]);
}

/** A doctor's OPD schedules across hospitals, with hospital name + slug. */
async function providerOpd(providerId) {
  return run(
    `SELECT o.id, o.hospital_id, o.day_of_week, o.start_time, o.end_time, o.consultation_type,
            o.max_tokens, o.notes_ml, o.notes_en,
            h.slug AS hospital_slug, h.name_ml AS hospital_name_ml, h.name_en AS hospital_name_en
       FROM opd_schedules o
       JOIN hospitals h ON h.id = o.hospital_id
            AND h.listing_status = 'published' AND h.verification_status = 'verified' AND h.deleted_at IS NULL
      WHERE o.provider_id = $1 AND ${ACTIVE_EFFECTIVE}
      ORDER BY h.name_en, o.start_time`, [providerId]);
}

export { hospitalOpd, providerOpd };
