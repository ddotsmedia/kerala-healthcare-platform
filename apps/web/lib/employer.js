// employer.js — employer profile + job listing management. Parameterised SQL.

import { randomBytes } from 'node:crypto';
import { getPool } from '@khp/db';
import { getSession } from './session.js';
import { currentEmployerProfile } from './jobs.js';

function slugify(s) {
  return String(s || 'job').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40)
    + '-' + randomBytes(3).toString('hex');
}

async function createEmployerProfile(data) {
  const s = getSession();
  if (!s) return { ok: false, error: 'unauthenticated' };
  const existing = await currentEmployerProfile();
  if (existing) return { ok: true, profile: existing };
  const { rows } = await getPool().query(
    `INSERT INTO employer_profiles (user_id, org_name, org_type, district_id, description, website)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [s.userId, data.org_name, data.org_type || null, data.district_id || null, data.description || null, data.website || null]);
  return { ok: true, profile: rows[0] };
}

async function listMyJobs() {
  const emp = await currentEmployerProfile();
  if (!emp) return [];
  const { rows } = await getPool().query(
    `SELECT j.id, j.slug, j.title, j.status, j.employment_type, j.created_at,
            (SELECT count(*) FROM job_applications a WHERE a.job_id = j.id) AS application_count
       FROM job_listings j WHERE j.employer_id = $1 AND j.deleted_at IS NULL
      ORDER BY j.created_at DESC`, [emp.id]);
  return rows;
}

async function getMyJob(jobId) {
  const emp = await currentEmployerProfile();
  if (!emp) return null;
  return (await getPool().query(
    `SELECT * FROM job_listings WHERE id = $1 AND employer_id = $2 AND deleted_at IS NULL`, [jobId, emp.id])).rows[0] || null;
}

async function createJob(data) {
  const emp = await currentEmployerProfile();
  if (!emp) return { ok: false, error: 'not_an_employer' };
  const { rows } = await getPool().query(
    `INSERT INTO job_listings (slug, employer_id, title, role_category, description, requirements,
       district_id, employment_type, experience_years_min, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'active') RETURNING id, slug`,
    [slugify(data.title), emp.id, data.title, data.role_category || null, data.description || null,
     data.requirements || null, data.district_id || null, data.employment_type || null,
     parseInt(data.experience_years_min, 10) || 0]);
  return { ok: true, job: rows[0] };
}

async function updateJob(jobId, data) {
  const emp = await currentEmployerProfile();
  if (!emp) return { ok: false, error: 'not_an_employer' };
  const { rows } = await getPool().query(
    `UPDATE job_listings SET title=COALESCE($3,title), role_category=COALESCE($4,role_category),
       description=COALESCE($5,description), requirements=COALESCE($6,requirements),
       employment_type=COALESCE($7,employment_type), updated_at=now()
      WHERE id=$1 AND employer_id=$2 AND deleted_at IS NULL RETURNING id`,
    [jobId, emp.id, data.title, data.role_category, data.description, data.requirements, data.employment_type]);
  return rows[0] ? { ok: true } : { ok: false, error: 'not_found' };
}

async function setJobStatus(jobId, status) {
  const emp = await currentEmployerProfile();
  if (!emp) return { ok: false, error: 'not_an_employer' };
  const { rows } = await getPool().query(
    `UPDATE job_listings SET status=$3, updated_at=now()
      WHERE id=$1 AND employer_id=$2 AND $3 IN ('active','closed','draft') RETURNING id, status`,
    [jobId, emp.id, status]);
  return rows[0] ? { ok: true, job: rows[0] } : { ok: false, error: 'not_found' };
}

export { createEmployerProfile, listMyJobs, getMyJob, createJob, updateJob, setJobStatus };
