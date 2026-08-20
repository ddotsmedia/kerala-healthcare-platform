// prescribe.js — doctor writes a digital prescription against one of their
// appointments. The prescription lands in the patient's PHR immediately.
// Doctor-scoped: the appointment's provider_id must match the doctor.

import { getPool } from '@khp/db';

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}

/** Fetch an appointment (with patient + doctor names) scoped to this doctor. */
export async function getAppointment(providerId, apptId) {
  if (!providerId || !apptId) return null;
  const r = await rows(
    `SELECT a.id, a.patient_id, a.slot_date, a.slot_start, a.consultation_mode, a.status,
            u.full_name AS patient_name, d.display_name AS doctor_name
       FROM appointments a
       JOIN users u ON u.id = a.patient_id
       JOIN doctors d ON d.id = a.provider_id
      WHERE a.id = $2 AND a.provider_id = $1 AND a.deleted_at IS NULL`,
    [providerId, apptId]
  );
  return r[0] || null;
}

/**
 * Issue a digital prescription for an appointment.
 * @param {object} p { medications:Array<{drug,dosage,frequency,duration,notes}>,
 *                      instructions, nextVisit, signature }
 * @returns {Promise<{id:string, patientId:string}|{error:string}>}
 */
export async function issuePrescription(providerId, apptId, p = {}) {
  const appt = await getAppointment(providerId, apptId);
  if (!appt) return { error: 'appointment_not_found' };
  const meds = (Array.isArray(p.medications) ? p.medications : [])
    .filter((m) => m && String(m.drug || '').trim());
  if (meds.length === 0) return { error: 'no_medications' };

  const [r] = await rows(
    `INSERT INTO prescriptions
       (user_id, appointment_id, doctor_name, doctor_id, created_by_doctor_id,
        is_digital, digital_signature, prescribed_date, valid_until, medications, notes)
     VALUES ($1,$2,$3,$4,$4,true,$5,current_date,$6,$7::jsonb,$8)
     RETURNING id, user_id`,
    [appt.patient_id, apptId, appt.doctor_name, providerId,
      String(p.signature || '').trim() || null,
      p.nextVisit || null, JSON.stringify(meds),
      String(p.instructions || '').trim() || null]
  );
  return { id: r.id, patientId: r.user_id };
}
