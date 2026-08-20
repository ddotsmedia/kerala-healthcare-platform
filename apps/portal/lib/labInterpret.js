// labInterpret.js — doctor interprets a patient's lab report against an
// appointment. Appointment-scoped (getAppointment guards provider→patient).
// lab_reports has no per-doctor share flag, so a doctor may interpret any lab
// report of a patient who has booked with them.

import { getPool } from '@khp/db';
import { getAppointment } from './prescribe.js';

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}

/** Appointment + the patient's lab reports, for the interpretation form. */
export async function getAppointmentPatientReports(providerId, apptId) {
  const appt = await getAppointment(providerId, apptId);
  if (!appt) return null;
  const reports = await rows(
    `SELECT id, lab_name, report_type, report_date
       FROM lab_reports
      WHERE user_id = $1 AND deleted_at IS NULL
      ORDER BY report_date DESC`,
    [appt.patient_id]
  );
  return { appt, reports };
}

const URGENCY = ['routine', 'soon', 'urgent'];

/**
 * @param {object} p { labReportId, interpretation, recommendations, nextTestDate, urgency, isShared }
 */
export async function addInterpretation(providerId, apptId, p = {}) {
  const appt = await getAppointment(providerId, apptId);
  if (!appt) return { error: 'appointment_not_found' };
  const text = String(p.interpretation || '').trim();
  if (!text) return { error: 'interpretation_required' };

  let labReportId = p.labReportId || null;
  if (labReportId) {
    const ok = await rows(
      `SELECT 1 FROM lab_reports WHERE id=$1 AND user_id=$2 AND deleted_at IS NULL`,
      [labReportId, appt.patient_id]
    );
    if (ok.length === 0) labReportId = null; // not the patient's report — detach
  }
  const urgency = URGENCY.includes(p.urgency) ? p.urgency : 'routine';

  const [r] = await rows(
    `INSERT INTO lab_interpretations
       (provider_id, patient_id, lab_report_id, appointment_id, interpretation,
        recommendations, next_test_date, urgency, is_shared_with_patient)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [providerId, appt.patient_id, labReportId, apptId, text,
      String(p.recommendations || '').trim() || null,
      p.nextTestDate || null, urgency, p.isShared !== false]
  );
  return { id: r.id, patientId: appt.patient_id };
}
