// hospitalPortal.js — hospital admin portal data (home stats, affiliated doctors,
// appointments, analytics). Reads the hospital from the session (see hospital.js).

import { getPool } from '@khp/db';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`hospital portal query failed: ${err.message}`); return []; }
}

export async function homeStats(hospitalId) {
  if (!hospitalId) return null;
  const r = await run(
    `SELECT
       (SELECT count(*) FROM hospital_departments WHERE hospital_id=$1 AND deleted_at IS NULL)::int AS departments,
       (SELECT count(*) FROM hospital_services WHERE hospital_id=$1 AND deleted_at IS NULL)::int AS services,
       (SELECT count(*) FROM hospital_providers WHERE hospital_id=$1 AND deleted_at IS NULL)::int AS doctors,
       (SELECT count(*) FROM appointments WHERE hospital_id=$1 AND slot_date=current_date AND status='confirmed' AND deleted_at IS NULL)::int AS today_appointments`,
    [hospitalId]);
  return r[0] || null;
}

export function affiliatedDoctors(hospitalId) {
  return run(
    `SELECT hp.id AS affiliation_id, d.id AS doctor_id, d.display_name, d.slug,
            d.nmc_registration_no, d.verification_status, s.name_en AS specialty_en,
            dep.name_en AS department_en, hp.role
       FROM hospital_providers hp
       JOIN doctors d ON d.id = hp.doctor_id AND d.deleted_at IS NULL
       LEFT JOIN specialties s ON s.id = d.specialty_id
       LEFT JOIN hospital_departments dep ON dep.id = hp.department_id
      WHERE hp.hospital_id = $1 AND hp.deleted_at IS NULL
      ORDER BY d.display_name`, [hospitalId]);
}

/** Add a doctor to the hospital by NMC registration number. */
export async function addDoctorByReg(hospitalId, regNo) {
  const reg = String(regNo || '').trim();
  if (!hospitalId || !reg) return { error: 'missing' };
  const d = await run(`SELECT id FROM doctors WHERE nmc_registration_no = $1 AND deleted_at IS NULL LIMIT 1`, [reg]);
  if (!d[0]) return { error: 'doctor_not_found' };
  const rows = await run(
    `INSERT INTO hospital_providers (hospital_id, doctor_id) VALUES ($1, $2)
     ON CONFLICT (hospital_id, doctor_id) DO NOTHING RETURNING id`, [hospitalId, d[0].id]);
  return rows[0] ? { ok: true } : { ok: true, existing: true };
}

export async function removeAffiliation(hospitalId, affiliationId) {
  await run(`UPDATE hospital_providers SET deleted_at = now() WHERE id = $1 AND hospital_id = $2`, [affiliationId, hospitalId]);
  return { ok: true };
}

export function todaysAppointments(hospitalId, { doctorId } = {}) {
  const where = [`a.hospital_id = $1`, `a.slot_date = current_date`, `a.deleted_at IS NULL`];
  const values = [hospitalId];
  if (doctorId) { values.push(doctorId); where.push(`a.provider_id = $${values.length}`); }
  return run(
    `SELECT a.id, a.slot_start, a.status, a.consultation_mode,
            d.display_name AS doctor_name, u.full_name AS patient_name
       FROM appointments a
       JOIN doctors d ON d.id = a.provider_id
       LEFT JOIN users u ON u.id = a.patient_id
      WHERE ${where.join(' AND ')} ORDER BY a.slot_start`, values);
}

export async function hospitalAnalytics(hospitalId) {
  const byDept = await run(
    `SELECT COALESCE(dep.name_en, 'Unassigned') AS department, count(*)::int AS n
       FROM appointments a
       JOIN hospital_providers hp ON hp.doctor_id = a.provider_id AND hp.hospital_id = a.hospital_id AND hp.deleted_at IS NULL
       LEFT JOIN hospital_departments dep ON dep.id = hp.department_id
      WHERE a.hospital_id = $1 AND a.slot_date >= current_date - 30 AND a.deleted_at IS NULL
      GROUP BY 1 ORDER BY n DESC`, [hospitalId]);
  const byDoctor = await run(
    `SELECT d.display_name AS doctor, count(*)::int AS appointments,
            count(*) FILTER (WHERE a.status='completed')::int AS completed
       FROM appointments a JOIN doctors d ON d.id = a.provider_id
      WHERE a.hospital_id = $1 AND a.slot_date >= current_date - 30 AND a.deleted_at IS NULL
      GROUP BY d.display_name ORDER BY appointments DESC LIMIT 20`, [hospitalId]);
  const total = await run(
    `SELECT count(*)::int AS n FROM appointments WHERE hospital_id=$1 AND slot_date >= current_date - 30 AND deleted_at IS NULL`, [hospitalId]);
  return { byDept, byDoctor, total30: total[0]?.n || 0 };
}
