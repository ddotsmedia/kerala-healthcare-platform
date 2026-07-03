// jobs.js — jobs portal data access (read side + profile resolution).
// Parameterised SQL only. Fails soft.

import { getPool } from '@khp/db';
import { buildJobQuery } from '@khp/search';
import { getSession } from './session.js';

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { console.error(`jobs query failed: ${err.message}`); return []; }
}

function searchJobs(opts) {
  const q = buildJobQuery(opts);
  return run(q.text, q.values);
}

async function getJobBySlug(slug) {
  return (await run(
    `SELECT j.*, e.org_name, e.org_type, e.website, e.logo_url, e.verified AS employer_verified,
            di.name_ml AS district_ml, di.name_en AS district_en,
            sp.name_en AS specialty_en
       FROM job_listings j
       JOIN employer_profiles e ON e.id = j.employer_id
       LEFT JOIN districts di ON di.id = j.district_id
       LEFT JOIN specialties sp ON sp.id = j.specialty_id
      WHERE j.slug = $1 AND j.deleted_at IS NULL`, [slug]))[0] || null;
}

/** Public candidate profile — NO contact fields (contact protection). */
async function getCandidateBySlug(slug) {
  const c = (await run(
    `SELECT cp.id, cp.slug, cp.role_category, cp.experience_years, cp.headline,
            cp.summary, cp.is_open_to_work,
            di.name_en AS district_en, di.name_ml AS district_ml
       FROM candidate_profiles cp
       LEFT JOIN districts di ON di.id = cp.district_id
      WHERE cp.slug = $1 AND cp.deleted_at IS NULL`, [slug]))[0];
  if (!c) return null;
  c.education = await run(`SELECT degree, institution, year FROM candidate_education WHERE candidate_id=$1 AND deleted_at IS NULL ORDER BY year DESC NULLS LAST`, [c.id]);
  c.experience = await run(`SELECT employer, role, from_year, to_year FROM candidate_experience WHERE candidate_id=$1 AND deleted_at IS NULL ORDER BY from_year DESC NULLS LAST`, [c.id]);
  return c;
}

/** Employer profile owned by the current session user (or null). */
async function currentEmployerProfile() {
  const s = (await getSession());
  if (!s) return null;
  return (await run(`SELECT * FROM employer_profiles WHERE user_id=$1 AND deleted_at IS NULL LIMIT 1`, [s.userId]))[0] || null;
}

/** Candidate profile owned by the current session user (or null). */
async function currentCandidateProfile() {
  const s = (await getSession());
  if (!s) return null;
  return (await run(`SELECT * FROM candidate_profiles WHERE user_id=$1 AND deleted_at IS NULL LIMIT 1`, [s.userId]))[0] || null;
}

export { searchJobs, getJobBySlug, getCandidateBySlug, currentEmployerProfile, currentCandidateProfile };
