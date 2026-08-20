// Doctor lab interpretations shared with the patient, for the PHR detail view.

import { getPool } from '@khp/db';

/** Interpretations for a lab report that the owning patient is allowed to see. */
export async function sharedInterpretations(labReportId, userId) {
  if (!labReportId || !userId) return [];
  try {
    const { rows } = await getPool().query(
      `SELECT li.id, li.interpretation, li.recommendations, li.next_test_date,
              li.urgency, li.created_at, d.display_name AS doctor_name
         FROM lab_interpretations li
         LEFT JOIN doctors d ON d.id = li.provider_id
        WHERE li.lab_report_id = $1 AND li.patient_id = $2
          AND li.is_shared_with_patient = true AND li.deleted_at IS NULL
        ORDER BY li.created_at DESC`,
      [labReportId, userId]
    );
    return rows;
  } catch (err) {
    console.error(`sharedInterpretations failed: ${err.message}`);
    return [];
  }
}
