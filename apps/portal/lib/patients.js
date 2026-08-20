// patients.js — the logged-in doctor's patient list, per-patient history, clinical
// notes and follow-up reminders. All scoped to the doctor (provider_id).
// A doctor may only act on patients who have booked with them. Parameterised SQL.

import { getPool } from '@khp/db';

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}

/** True if the patient has (or had) any appointment with this doctor. */
async function isMyPatient(providerId, patientId) {
  if (!providerId || !patientId) return false;
  const r = await rows(
    `SELECT 1 FROM appointments WHERE provider_id=$1 AND patient_id=$2 AND deleted_at IS NULL LIMIT 1`,
    [providerId, patientId]
  );
  return r.length > 0;
}

/** All patients who have booked with this doctor. Optional name search. */
export async function listPatients(providerId, search = '') {
  if (!providerId) return [];
  const q = `%${String(search || '').trim().toLowerCase()}%`;
  return rows(
    `SELECT u.id AS patient_id, u.full_name,
            count(*)::int AS total_visits,
            max(a.slot_date) AS last_visit,
            count(*) FILTER (WHERE a.slot_date >= current_date AND a.status='confirmed')::int AS upcoming,
            (SELECT count(*) FROM patient_notes pn
               WHERE pn.provider_id=$1 AND pn.patient_id=u.id AND pn.deleted_at IS NULL)::int AS note_count
       FROM appointments a
       JOIN users u ON u.id = a.patient_id
      WHERE a.provider_id=$1 AND a.deleted_at IS NULL
        AND ($2='%%' OR lower(coalesce(u.full_name,'')) LIKE $2)
      GROUP BY u.id, u.full_name
      ORDER BY max(a.slot_date) DESC NULLS LAST`,
    [providerId, q]
  );
}

/** One patient's full record for this doctor: profile, timeline, notes, shared records. */
export async function getPatient(providerId, patientId) {
  if (!(await isMyPatient(providerId, patientId))) return null;
  const [profile] = await rows(`SELECT id, full_name FROM users WHERE id=$1`, [patientId]);
  const timeline = await rows(
    `SELECT a.id, a.booking_ref, a.slot_date, a.slot_start, a.consultation_mode, a.status, a.notes_for_doctor
       FROM appointments a
      WHERE a.provider_id=$1 AND a.patient_id=$2 AND a.deleted_at IS NULL
      ORDER BY a.slot_date DESC, a.slot_start DESC`,
    [providerId, patientId]
  );
  const notes = await listNotes(providerId, patientId);
  const sharedRecords = await rows(
    `SELECT id, record_type, title, record_date, doctor_name, hospital_name
       FROM health_records
      WHERE user_id=$1 AND is_shared=true AND deleted_at IS NULL
      ORDER BY record_date DESC NULLS LAST LIMIT 50`,
    [patientId]
  );
  const followUps = await rows(
    `SELECT id, due_date, reason, status FROM follow_up_reminders
      WHERE provider_id=$1 AND patient_id=$2 AND deleted_at IS NULL
      ORDER BY due_date DESC`,
    [providerId, patientId]
  );
  return { profile, timeline, notes, sharedRecords, followUps };
}

export async function listNotes(providerId, patientId) {
  return rows(
    `SELECT id, note, note_type, is_private, appointment_id, created_at
       FROM patient_notes
      WHERE provider_id=$1 AND patient_id=$2 AND deleted_at IS NULL
      ORDER BY created_at DESC`,
    [providerId, patientId]
  );
}

const NOTE_TYPES = ['clinical', 'follow_up', 'lab_instruction', 'alert'];

export async function addNote(providerId, patientId, { note, noteType, isPrivate, appointmentId } = {}) {
  const body = String(note || '').trim();
  if (!body) return { error: 'note_required' };
  if (!(await isMyPatient(providerId, patientId))) return { error: 'not_your_patient' };
  const type = NOTE_TYPES.includes(noteType) ? noteType : 'clinical';
  const [r] = await rows(
    `INSERT INTO patient_notes (provider_id, patient_id, appointment_id, note, note_type, is_private)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [providerId, patientId, appointmentId || null, body, type, isPrivate !== false]
  );
  return { id: r.id };
}

export async function createFollowUp(providerId, patientId, { dueDate, reason } = {}) {
  if (!dueDate) return { error: 'due_date_required' };
  if (!(await isMyPatient(providerId, patientId))) return { error: 'not_your_patient' };
  const [r] = await rows(
    `INSERT INTO follow_up_reminders (provider_id, patient_id, due_date, reason)
     VALUES ($1,$2,$3,$4) RETURNING id`,
    [providerId, patientId, dueDate, String(reason || '').trim() || null]
  );
  return { id: r.id };
}

/** Follow-ups due within the next `days` days (default 7), still actionable. */
export async function listFollowUps(providerId, days = 7) {
  if (!providerId) return [];
  const d = Math.max(1, Math.min(90, parseInt(days, 10) || 7));
  return rows(
    `SELECT f.id, f.patient_id, u.full_name, f.due_date, f.reason, f.status
       FROM follow_up_reminders f
       JOIN users u ON u.id = f.patient_id
      WHERE f.provider_id=$1 AND f.deleted_at IS NULL
        AND f.status IN ('pending','sent')
        AND f.due_date <= current_date + $2::int
      ORDER BY f.due_date ASC`,
    [providerId, d]
  );
}

const FOLLOW_STATUS = ['pending', 'sent', 'completed', 'dismissed'];

export async function updateFollowUp(providerId, id, status) {
  if (!FOLLOW_STATUS.includes(status)) return { error: 'bad_status' };
  const r = await rows(
    `UPDATE follow_up_reminders SET status=$3, updated_at=now()
      WHERE id=$2 AND provider_id=$1 AND deleted_at IS NULL RETURNING id`,
    [providerId, id, status]
  );
  return r.length ? { id: r[0].id } : { error: 'not_found' };
}
