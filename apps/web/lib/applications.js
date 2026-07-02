// applications.js — job application flow with contact protection + notifications.
// Parameterised SQL only. Contact/portfolio (resume/linkedin) is revealed to the
// employer only once the application reaches shortlisted+.

import { getPool } from '@khp/db';
import { sendSms } from '@khp/notifications';
import { getSession } from './session.js';
import { currentCandidateProfile, currentEmployerProfile } from './jobs.js';

const REVEALED = ['shortlisted', 'interview', 'offered'];

/** Candidate applies to a job (one per job — ON CONFLICT DO NOTHING). */
async function applyToJob(jobId, coverLetter) {
  const cand = await currentCandidateProfile();
  if (!cand) return { ok: false, error: 'not_a_candidate' };
  const { rows } = await getPool().query(
    `INSERT INTO job_applications (job_id, candidate_id, cover_letter, status_changed_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (job_id, candidate_id) DO NOTHING
     RETURNING id, status`,
    [jobId, cand.id, coverLetter || null]);
  return rows[0] ? { ok: true, application: rows[0] } : { ok: true, application: null, duplicate: true };
}

/** Employer views applications for one of their own jobs. Contact-protected. */
async function listApplicationsForJob(jobId) {
  const emp = await currentEmployerProfile();
  if (!emp) return { ok: false, error: 'not_an_employer' };
  const owns = (await getPool().query(
    `SELECT 1 FROM job_listings WHERE id = $1 AND employer_id = $2 AND deleted_at IS NULL`, [jobId, emp.id])).rowCount;
  if (!owns) return { ok: false, error: 'forbidden' };
  const { rows } = await getPool().query(
    `SELECT a.id, a.status, a.cover_letter, a.employer_notes, a.created_at,
            cp.slug AS candidate_slug, cp.headline, cp.role_category, cp.experience_years,
            CASE WHEN a.status = ANY($2) THEN cp.resume_url ELSE NULL END AS resume_url,
            CASE WHEN a.status = ANY($2) THEN cp.linkedin_url ELSE NULL END AS linkedin_url,
            (a.status = ANY($2)) AS contact_visible
       FROM job_applications a
       JOIN candidate_profiles cp ON cp.id = a.candidate_id
      WHERE a.job_id = $1 ORDER BY a.created_at DESC`,
    [jobId, REVEALED]);
  return { ok: true, applications: rows };
}

async function notifyCandidate(applicationId, status) {
  const pool = getPool();
  const row = (await pool.query(
    `SELECT cp.user_id, j.title FROM job_applications a
       JOIN candidate_profiles cp ON cp.id = a.candidate_id
       JOIN job_listings j ON j.id = a.job_id WHERE a.id = $1`, [applicationId])).rows[0];
  if (!row) return;
  const msg = `Your application for "${row.title}" is now: ${status}.`;
  if (row.user_id) {
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body) VALUES ($1,'job_status',$2,$3)`,
      [row.user_id, 'Application update', msg]);
  }
  await sendSms(process.env.DEMO_NOTIFY_TO || null, msg);
}

/** Employer updates an application status (shortlist/interview/offer/reject). */
async function updateApplicationStatus(applicationId, status, notes) {
  const emp = await currentEmployerProfile();
  if (!emp) return { ok: false, error: 'not_an_employer' };
  const { rows } = await getPool().query(
    `UPDATE job_applications a
        SET status = $3, employer_notes = COALESCE($4, employer_notes),
            status_changed_at = now(), updated_at = now()
       FROM job_listings j
      WHERE a.id = $1 AND a.job_id = j.id AND j.employer_id = $2
        AND $3 IN ('shortlisted','interview','offered','rejected')
      RETURNING a.id, a.status`,
    [applicationId, emp.id, status, notes || null]);
  if (!rows[0]) return { ok: false, error: 'forbidden_or_invalid' };
  await notifyCandidate(applicationId, status);
  return { ok: true, application: rows[0] };
}

/** Candidate withdraws their own application. */
async function withdrawApplication(applicationId) {
  const cand = await currentCandidateProfile();
  if (!cand) return { ok: false, error: 'not_a_candidate' };
  const { rows } = await getPool().query(
    `UPDATE job_applications SET status = 'withdrawn', status_changed_at = now(), updated_at = now()
      WHERE id = $1 AND candidate_id = $2 AND status NOT IN ('withdrawn','rejected')
      RETURNING id, status`,
    [applicationId, cand.id]);
  return rows[0] ? { ok: true, application: rows[0] } : { ok: false, error: 'not_withdrawable' };
}

/** Candidate's own applications with job info. */
async function listMyApplications() {
  const cand = await currentCandidateProfile();
  if (!cand) return [];
  const { rows } = await getPool().query(
    `SELECT a.id, a.status, a.status_changed_at, a.created_at,
            j.slug AS job_slug, j.title, e.org_name
       FROM job_applications a
       JOIN job_listings j ON j.id = a.job_id
       JOIN employer_profiles e ON e.id = j.employer_id
      WHERE a.candidate_id = $1 ORDER BY a.created_at DESC`, [cand.id]);
  return rows;
}

/** Unread in-app notifications for the session user. */
async function myNotifications() {
  const s = getSession();
  if (!s) return [];
  const { rows } = await getPool().query(
    `SELECT id, type, title, body, read_at, created_at FROM notifications
      WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`, [s.userId]);
  return rows;
}

export {
  applyToJob, listApplicationsForJob, updateApplicationStatus,
  withdrawApplication, listMyApplications, myNotifications
};
