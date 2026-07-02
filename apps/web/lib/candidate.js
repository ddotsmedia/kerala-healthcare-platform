// candidate.js — candidate profile + saved jobs management. Parameterised SQL.

import { randomBytes } from 'node:crypto';
import { getPool } from '@khp/db';
import { getSession } from './session.js';
import { currentCandidateProfile } from './jobs.js';

function slugify(s) {
  return String(s || 'candidate').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
    + '-' + randomBytes(3).toString('hex');
}

async function upsertCandidateProfile(data) {
  const s = getSession();
  if (!s) return { ok: false, error: 'unauthenticated' };
  const existing = await currentCandidateProfile();
  if (existing) {
    await getPool().query(
      `UPDATE candidate_profiles SET role_category=COALESCE($2,role_category),
         district_id=COALESCE($3,district_id), experience_years=COALESCE($4,experience_years),
         headline=COALESCE($5,headline), summary=COALESCE($6,summary),
         resume_url=COALESCE($7,resume_url), linkedin_url=COALESCE($8,linkedin_url),
         is_open_to_work=$9, updated_at=now()
        WHERE id=$1`,
      [existing.id, data.role_category, data.district_id || null,
       data.experience_years != null ? parseInt(data.experience_years, 10) : null,
       data.headline, data.summary, data.resume_url, data.linkedin_url, data.is_open_to_work !== false]);
    return { ok: true, id: existing.id };
  }
  const { rows } = await getPool().query(
    `INSERT INTO candidate_profiles (user_id, slug, role_category, district_id, experience_years, headline, summary, resume_url, linkedin_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
    [s.userId, slugify(data.headline || data.role_category), data.role_category || null, data.district_id || null,
     parseInt(data.experience_years, 10) || 0, data.headline || null, data.summary || null, data.resume_url || null, data.linkedin_url || null]);
  return { ok: true, id: rows[0].id };
}

async function saveJob(jobId) {
  const cand = await currentCandidateProfile();
  if (!cand) return { ok: false, error: 'not_a_candidate' };
  await getPool().query(
    `INSERT INTO saved_jobs (candidate_id, job_id) VALUES ($1,$2) ON CONFLICT (candidate_id, job_id) DO NOTHING`,
    [cand.id, jobId]);
  return { ok: true };
}

async function unsaveJob(jobId) {
  const cand = await currentCandidateProfile();
  if (!cand) return { ok: false, error: 'not_a_candidate' };
  await getPool().query(`DELETE FROM saved_jobs WHERE candidate_id=$1 AND job_id=$2`, [cand.id, jobId]);
  return { ok: true };
}

async function listSavedJobs() {
  const cand = await currentCandidateProfile();
  if (!cand) return [];
  const { rows } = await getPool().query(
    `SELECT j.id, j.slug, j.title, e.org_name, j.status
       FROM saved_jobs sj JOIN job_listings j ON j.id = sj.job_id
       JOIN employer_profiles e ON e.id = j.employer_id
      WHERE sj.candidate_id = $1 AND j.deleted_at IS NULL ORDER BY sj.created_at DESC`, [cand.id]);
  return rows;
}

export { upsertCandidateProfile, saveJob, unsaveJob, listSavedJobs };
