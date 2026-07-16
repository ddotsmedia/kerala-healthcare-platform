// blood.js — blood donor registry + requests + district-matched alert engine.
// Registration/requests require login. Public read of active requests. Fails soft.

import { getPool } from '@khp/db';
import { sendEmail } from '@khp/notifications';
import { currentPatientId } from './appointments.js';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const URGENCY = ['urgent', 'high', 'normal'];
const REQUEST_TTL_HOURS = 72;

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`blood query failed: ${err.message}`); return []; }
}

/** Register (or update) the current user's donor profile. Upsert on user_id. */
async function registerDonor(b) {
  const uid = await currentPatientId();
  if (!uid) return { error: 'unauthenticated' };
  if (!BLOOD_GROUPS.includes(b.blood_group)) return { error: 'invalid_blood_group' };
  if (!b.district_id) return { error: 'invalid_district' };
  const rows = await run(
    `INSERT INTO blood_donors
       (user_id, blood_group, district_id, last_donation_date, is_available,
        notify_by_email, notify_by_sms, medical_conditions)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (user_id) DO UPDATE SET
       blood_group = EXCLUDED.blood_group, district_id = EXCLUDED.district_id,
       last_donation_date = EXCLUDED.last_donation_date, is_available = EXCLUDED.is_available,
       notify_by_email = EXCLUDED.notify_by_email, notify_by_sms = EXCLUDED.notify_by_sms,
       medical_conditions = EXCLUDED.medical_conditions, deleted_at = NULL, updated_at = now()
     RETURNING id`,
    [uid, b.blood_group, b.district_id, b.last_donation_date || null, b.is_available !== false,
     b.notify_by_email !== false, b.notify_by_sms === true, (b.medical_conditions || '').slice(0, 1000) || null]);
  return rows[0] ? { ok: true, id: rows[0].id } : { error: 'register_failed' };
}

/** Current user's donor profile (or null). */
async function myDonorProfile() {
  const uid = await currentPatientId();
  if (!uid) return null;
  const rows = await run(
    `SELECT d.id, d.blood_group, d.district_id, d.is_available, d.last_donation_date,
            d.notify_by_email, d.notify_by_sms, di.name_ml AS district_ml, di.name_en AS district_en
       FROM blood_donors d LEFT JOIN districts di ON di.id = d.district_id
      WHERE d.user_id = $1 AND d.deleted_at IS NULL`, [uid]);
  return rows[0] || null;
}

/** Toggle the current user's availability. */
async function updateAvailability(isAvailable) {
  const uid = await currentPatientId();
  if (!uid) return { error: 'unauthenticated' };
  const rows = await run(
    `UPDATE blood_donors SET is_available = $2, updated_at = now()
      WHERE user_id = $1 AND deleted_at IS NULL RETURNING is_available`, [uid, isAvailable === true]);
  return rows[0] ? { ok: true, is_available: rows[0].is_available } : { error: 'not_registered' };
}

/** Active (unfulfilled, unexpired) blood requests, optionally filtered. */
function listRequests({ districtId, bloodGroup, page = 1, limit = 20 } = {}) {
  const where = ['r.is_fulfilled = false', 'r.deleted_at IS NULL', '(r.expires_at IS NULL OR r.expires_at > now())'];
  const values = [];
  if (districtId) { values.push(districtId); where.push(`r.district_id = $${values.length}`); }
  if (bloodGroup && BLOOD_GROUPS.includes(bloodGroup)) { values.push(bloodGroup); where.push(`r.blood_group = $${values.length}`); }
  const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  const off = (Math.max(1, parseInt(page, 10) || 1) - 1) * lim;
  values.push(lim); const li = values.length;
  values.push(off); const oi = values.length;
  return run(
    `SELECT r.id, r.hospital_name, r.blood_group, r.units_needed, r.contact_phone,
            r.urgency, r.created_at, r.expires_at, di.name_ml AS district_ml, di.name_en AS district_en
       FROM blood_requests r LEFT JOIN districts di ON di.id = r.district_id
      WHERE ${where.join(' AND ')} ORDER BY
        CASE r.urgency WHEN 'urgent' THEN 0 WHEN 'high' THEN 1 ELSE 2 END, r.created_at DESC
      LIMIT $${li} OFFSET $${oi}`, values);
}

/** Create a blood request (login required), then alert matching donors. */
async function createRequest(b) {
  const uid = await currentPatientId();
  if (!uid) return { error: 'unauthenticated' };
  if (!BLOOD_GROUPS.includes(b.blood_group)) return { error: 'invalid_blood_group' };
  if (!b.district_id) return { error: 'invalid_district' };
  const phone = String(b.contact_phone || '').trim();
  if (!phone) return { error: 'invalid_phone' };
  const urgency = URGENCY.includes(b.urgency) ? b.urgency : 'urgent';
  const units = Math.max(1, Math.min(20, parseInt(b.units_needed, 10) || 1));
  const rows = await run(
    `INSERT INTO blood_requests
       (requester_id, hospital_name, blood_group, units_needed, district_id, contact_phone, urgency, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7, now() + ($8 || ' hours')::interval)
     RETURNING id, blood_group, district_id, hospital_name, contact_phone`,
    [uid, (b.hospital_name || '').slice(0, 200) || null, b.blood_group, units, b.district_id, phone, urgency, String(REQUEST_TTL_HOURS)]);
  const req = rows[0];
  if (!req) return { error: 'request_failed' };
  const alerted = await alertMatchingDonors(req);
  return { ok: true, id: req.id, alerted };
}

/** Email available donors in the same district + blood group. Max 1 alert/donor/day. */
async function alertMatchingDonors(req) {
  const donors = await run(
    `SELECT d.id, u.email, u.full_name, di.name_en AS district_en
       FROM blood_donors d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN districts di ON di.id = d.district_id
      WHERE d.district_id = $1 AND d.blood_group = $2
        AND d.is_available = true AND d.deleted_at IS NULL AND d.notify_by_email = true
        AND u.email IS NOT NULL
        AND (d.last_alerted_at IS NULL OR d.last_alerted_at < now() - interval '1 day')`,
    [req.district_id, req.blood_group]);
  let sent = 0;
  for (const dn of donors) {
    const where = req.hospital_name ? `${req.hospital_name}, ${dn.district_en || ''}` : (dn.district_en || 'your district');
    const subject = `Urgent: ${req.blood_group} blood needed at ${where}`;
    const html = `<p>Dear ${dn.full_name || 'Donor'},</p>
      <p>A patient urgently needs <b>${req.blood_group}</b> blood at <b>${where}</b>.</p>
      <p>If you can help, please contact: <b>${req.contact_phone}</b></p>
      <p>Thank you for saving lives.<br/>— MalayaliDoctor Blood Registry</p>
      <hr/><p style="font-size:12px;color:#888">You receive this because you registered as a blood donor. Emergency: 112 · Ambulance: 108. This is not medical advice.</p>`;
    const r = await sendEmail(dn.email, subject, html);
    if (r.status === 'sent' || r.status === 'simulated') sent += 1;
    await run(`UPDATE blood_donors SET last_alerted_at = now() WHERE id = $1`, [dn.id]);
  }
  return sent;
}

export { registerDonor, myDonorProfile, updateAvailability, listRequests, createRequest, BLOOD_GROUPS, URGENCY };
