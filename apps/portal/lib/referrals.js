// referrals.js — specialist referrals between doctors. Doctor-scoped:
// createReferral/listSent by the referring doctor; listReceived/updateOutcome
// by the referred-to doctor. Parameterised SQL.

import { getPool } from '@khp/db';
import { getAppointment } from './prescribe.js';

async function rows(text, values) {
  return (await getPool().query(text, values)).rows;
}

/** Find published doctors by name or specialty, excluding the referring doctor. */
export async function searchSpecialists(q, excludeId) {
  const term = `%${String(q || '').trim().toLowerCase()}%`;
  if (term === '%%') return [];
  return rows(
    `SELECT d.id, d.display_name, d.slug, s.name_en AS specialty, di.name_en AS district
       FROM doctors d
       LEFT JOIN specialties s ON s.id = d.specialty_id
       LEFT JOIN districts di ON di.id = d.district_id
      WHERE d.deleted_at IS NULL AND d.listing_status='published' AND d.id <> $2
        AND (lower(d.display_name) LIKE $1 OR lower(coalesce(s.name_en,'')) LIKE $1)
      ORDER BY d.display_name LIMIT 20`,
    [term, excludeId || '00000000-0000-0000-0000-000000000000']
  );
}

const URGENCY = ['routine', 'soon', 'urgent'];

export async function createReferral(referringId, p = {}) {
  const referredToId = p.referredToId;
  const reason = String(p.reason || '').trim();
  if (!referredToId) return { error: 'specialist_required' };
  if (!reason) return { error: 'reason_required' };

  let patientId = p.patientId;
  let appointmentId = p.appointmentId || null;
  if (appointmentId) {
    const appt = await getAppointment(referringId, appointmentId);
    if (!appt) return { error: 'appointment_not_found' };
    patientId = appt.patient_id;
  }
  if (!patientId) return { error: 'patient_required' };
  const urgency = URGENCY.includes(p.urgency) ? p.urgency : 'routine';

  const [r] = await rows(
    `INSERT INTO referral_letters
       (referring_doctor_id, referred_to_doctor_id, patient_id, reason, clinical_summary, urgency, appointment_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, patient_id`,
    [referringId, referredToId, patientId, reason, String(p.clinicalSummary || '').trim() || null, urgency, appointmentId]
  );
  return { id: r.id, patientId: r.patient_id };
}

export async function listSent(referringId) {
  return rows(
    `SELECT rl.id, rl.reason, rl.urgency, rl.status, rl.outcome, rl.created_at,
            d.display_name AS specialist_name, u.full_name AS patient_name
       FROM referral_letters rl
       JOIN doctors d ON d.id = rl.referred_to_doctor_id
       JOIN users u ON u.id = rl.patient_id
      WHERE rl.referring_doctor_id=$1 AND rl.deleted_at IS NULL
      ORDER BY rl.created_at DESC`,
    [referringId]
  );
}

export async function listReceived(referredToId) {
  return rows(
    `SELECT rl.id, rl.reason, rl.clinical_summary, rl.urgency, rl.status, rl.outcome, rl.created_at,
            d.display_name AS referrer_name, u.full_name AS patient_name
       FROM referral_letters rl
       JOIN doctors d ON d.id = rl.referring_doctor_id
       JOIN users u ON u.id = rl.patient_id
      WHERE rl.referred_to_doctor_id=$1 AND rl.deleted_at IS NULL
      ORDER BY rl.created_at DESC`,
    [referredToId]
  );
}

const STATUS = ['sent', 'acknowledged', 'completed', 'declined'];

/** The referred-to specialist updates the referral outcome/status. */
export async function updateOutcome(referredToId, id, { status, outcome } = {}) {
  const st = STATUS.includes(status) ? status : 'completed';
  const r = await rows(
    `UPDATE referral_letters SET status=$3, outcome=$4, updated_at=now()
      WHERE id=$2 AND referred_to_doctor_id=$1 AND deleted_at IS NULL
      RETURNING id`,
    [referredToId, id, st, String(outcome || '').trim() || null]
  );
  return r.length ? { id: r[0].id } : { error: 'not_found' };
}
