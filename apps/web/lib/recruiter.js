// recruiter.js — employer↔candidate search, contact requests, contact reveal.
// Contact protection: candidate contact is revealed to an employer ONLY after the
// candidate accepts that employer's request. All searches are audit-logged.

import { getPool } from '@khp/db';
import { buildCandidateQuery } from '@khp/search';
import { sendSms } from '@khp/notifications';
import { currentEmployerProfile, currentCandidateProfile } from './jobs.js';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`recruiter query failed: ${err.message}`); return null; }
}

/** Employer candidate search — logged for audit. Returns { rows } (no contact). */
async function searchCandidates(opts) {
  const emp = await currentEmployerProfile();
  if (!emp) return null;
  const q = buildCandidateQuery(opts);
  const rows = (await run(q.text, q.values)) || [];
  await run(`INSERT INTO candidate_search_log (employer_id, filters, result_count) VALUES ($1, $2::jsonb, $3)`,
    [emp.id, JSON.stringify(opts.filters || {}), rows.length]);
  return { rows, employerId: emp.id };
}

/** Whether this employer already has an accepted request for a candidate. */
async function acceptedFor(employerId, candidateId) {
  const r = await run(`SELECT status FROM recruiter_contact_requests
                         WHERE employer_id=$1 AND candidate_id=$2`, [employerId, candidateId]);
  return r && r[0] ? r[0].status : null;
}

/** Full candidate profile for an employer — contact hidden unless accepted. */
async function getCandidateForEmployer(id) {
  const emp = await currentEmployerProfile();
  if (!emp) return null;
  const rows = await run(
    `SELECT cp.id, cp.slug, cp.headline, cp.summary, cp.role_category, cp.specialty_id,
            cp.experience_years, cp.current_location, cp.expected_salary_min, cp.notice_period_days,
            cp.preferred_job_types, cp.preferred_districts, cp.last_active_at, cp.linkedin_url, cp.resume_url,
            cp.user_id, di.name_ml AS district_ml, di.name_en AS district_en, sp.name_en AS specialty_en
       FROM candidate_profiles cp
       LEFT JOIN districts di ON di.id = cp.district_id
       LEFT JOIN specialties sp ON sp.id = cp.specialty_id
      WHERE cp.id=$1 AND cp.deleted_at IS NULL AND cp.is_searchable = true`, [id]);
  const c = rows && rows[0];
  if (!c) return rows === null ? null : false;
  await run(`UPDATE candidate_profiles SET profile_views = COALESCE(profile_views,0)+1 WHERE id=$1`, [id]);

  const skills = (await run(`SELECT role FROM candidate_experience WHERE candidate_id=$1 AND deleted_at IS NULL LIMIT 8`, [id])) || [];
  const status = await acceptedFor(emp.id, id);
  const revealed = status === 'accepted';
  const { user_id, linkedin_url, resume_url, ...safe } = c;
  return {
    ...safe,
    experience: skills,
    request_status: status,
    contact_visible: revealed,
    contact: revealed
      ? { email: process.env.DEMO_NOTIFY_TO || null, linkedin_url, resume_url }
      : null
  };
}

/** Employer requests contact with a candidate. Notifies the candidate. */
async function requestContact(candidateId, message) {
  const emp = await currentEmployerProfile();
  if (!emp) return { ok: false, error: 'not_an_employer' };
  const cand = await run(`SELECT id, user_id FROM candidate_profiles WHERE id=$1 AND deleted_at IS NULL`, [candidateId]);
  if (!cand || !cand[0]) return { ok: false, error: 'candidate_not_found' };

  const rows = await run(
    `INSERT INTO recruiter_contact_requests (employer_id, candidate_id, message)
       VALUES ($1, $2, $3)
     ON CONFLICT (employer_id, candidate_id) DO NOTHING
     RETURNING id, status`, [emp.id, candidateId, (message || '').slice(0, 1000)]);
  if (!rows || !rows[0]) return { ok: true, duplicate: true };

  await run(`INSERT INTO notifications (user_id, type, title, body) VALUES ($1,'contact_request',$2,$3)`,
    [cand[0].user_id, 'New contact request', `${emp.org_name} wants to connect with you.`]);
  await sendSms(process.env.DEMO_NOTIFY_TO || null, `${emp.org_name} requested to contact you on Kerala Health Portal.`);
  return { ok: true, request: rows[0] };
}

/** Candidate's incoming contact requests, with employer details. */
async function listContactRequests() {
  const cand = await currentCandidateProfile();
  if (!cand) return null;
  return (await run(
    `SELECT r.id, r.message, r.status, r.created_at,
            e.org_name, e.org_type, e.website, e.logo_url, e.verified
       FROM recruiter_contact_requests r
       JOIN employer_profiles e ON e.id = r.employer_id
      WHERE r.candidate_id = $1 ORDER BY r.created_at DESC`, [cand.id])) || [];
}

/** Candidate accepts/rejects a request. Accept notifies the employer. */
async function respondContactRequest(requestId, accept) {
  const cand = await currentCandidateProfile();
  if (!cand) return null;
  const status = accept ? 'accepted' : 'rejected';
  const rows = await run(
    `UPDATE recruiter_contact_requests SET status=$1, updated_at=now()
      WHERE id=$2 AND candidate_id=$3 AND status='pending'
    RETURNING id, employer_id, status`, [status, requestId, cand.id]);
  const r = rows && rows[0];
  if (!r) return rows === null ? null : false;

  if (accept) {
    const emp = await run(`SELECT user_id FROM employer_profiles WHERE id=$1`, [r.employer_id]);
    if (emp && emp[0]) {
      await run(`INSERT INTO notifications (user_id, type, title, body) VALUES ($1,'contact_accepted',$2,$3)`,
        [emp[0].user_id, 'Contact request accepted', `${cand.headline || 'A candidate'} accepted your contact request.`]);
    }
    await sendSms(process.env.DEMO_NOTIFY_TO || null, 'A candidate accepted your contact request.');
  }
  return r;
}

export { searchCandidates, getCandidateForEmployer, requestContact, listContactRequests, respondContactRequest };
