// profile.js — extra data for doctor/hospital profile pages.
// Parameterised SQL only. Verified + published joins. Fails soft ([]).

import { getPool } from '@khp/db';
import { cached, TTL } from '@khp/cache';

const DPUB = "d.listing_status = 'published' AND d.verification_status = 'verified' AND d.deleted_at IS NULL";
const HPUB = "h.listing_status = 'published' AND h.verification_status = 'verified' AND h.deleted_at IS NULL";

async function run(text, values = []) {
  try {
    return (await getPool().query(text, values)).rows;
  } catch (err) {
    console.error(`profile query failed: ${err.message}`);
    return [];
  }
}

/** Hospitals a doctor practises at (via hospital_providers). */
export function doctorHospitals(doctorId) {
  return cached(`profile:dh:${doctorId}`, TTL.providers, () =>
    run(`SELECT h.id, h.slug, h.name_ml, h.name_en, h.address_ml, h.address_en, hp.role
           FROM hospital_providers hp
           JOIN hospitals h ON h.id = hp.hospital_id AND ${HPUB}
          WHERE hp.doctor_id = $1 AND hp.deleted_at IS NULL`, [doctorId]));
}

/** Weekly consultation availability (templates) for a doctor. */
export function doctorAvailability(doctorId) {
  return cached(`profile:av:${doctorId}`, TTL.slots, () =>
    run(`SELECT day_of_week, start_time, end_time, consultation_mode, slot_duration_minutes
           FROM availability_templates
          WHERE provider_id = $1 AND is_active = true AND deleted_at IS NULL
          ORDER BY day_of_week, start_time`, [doctorId]));
}

/** Doctors affiliated with a hospital (via hospital_providers) — for DoctorCard. */
export function hospitalDoctors(hospitalId, limit = 12) {
  const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  return cached(`profile:hd:${hospitalId}:${lim}`, TTL.providers, () =>
    run(`SELECT d.id, d.display_name, d.slug, d.photo_url, d.years_experience,
                d.consultation_fee, d.consultation_modes, d.languages,
                d.rating_avg, d.rating_count,
                s.name_ml AS specialty_ml, s.name_en AS specialty_en,
                di.name_ml AS district_ml, di.name_en AS district_en
           FROM hospital_providers hp
           JOIN doctors d ON d.id = hp.doctor_id AND ${DPUB}
           LEFT JOIN specialties s ON s.id = d.specialty_id
           LEFT JOIN districts di ON di.id = d.district_id
          WHERE hp.hospital_id = $1 AND hp.deleted_at IS NULL
          ORDER BY d.published_at DESC NULLS LAST
          LIMIT $2`, [hospitalId, lim]));
}
