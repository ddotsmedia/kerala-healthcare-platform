// candidates.js — parameterised recruiter candidate search. Searchable + open
// profiles only. Returns NO contact fields (contact protection is enforced here).

import { jobPaginate } from './jobs.js';

const SORTS = {
  recent: 'cp.last_active_at DESC NULLS LAST, cp.updated_at DESC',
  experience: 'cp.experience_years DESC NULLS LAST',
  salary_low: 'cp.expected_salary_min ASC NULLS LAST'
};

/**
 * @param {object} o { term, roleCategory, specialtyId, districtId, jobType,
 *   experienceYearsMin, experienceYearsMax, expectedSalaryMax, sort, page, limit }
 */
function buildCandidateQuery(o = {}) {
  const { offset, limit, page } = jobPaginate(o.page, o.limit);
  const where = ['cp.deleted_at IS NULL', 'cp.is_searchable = true', 'cp.is_open_to_work = true'];
  const values = [];
  const eq = (val, expr) => { if (val != null && val !== '') { values.push(val); where.push(`${expr} = $${values.length}`); } };
  const num = (v) => { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; };

  if (o.term) {
    values.push(`%${o.term}%`);
    where.push(`(cp.headline ILIKE $${values.length} OR cp.summary ILIKE $${values.length} OR cp.role_category ILIKE $${values.length})`);
  }
  eq(o.roleCategory, 'cp.role_category');
  eq(o.specialtyId, 'cp.specialty_id');
  eq(o.districtId, 'cp.district_id');

  const expMin = num(o.experienceYearsMin);
  if (expMin != null) { values.push(expMin); where.push(`cp.experience_years >= $${values.length}`); }
  const expMax = num(o.experienceYearsMax);
  if (expMax != null) { values.push(expMax); where.push(`cp.experience_years <= $${values.length}`); }

  const salMax = num(o.expectedSalaryMax);
  if (salMax != null) { values.push(salMax); where.push(`(cp.expected_salary_min IS NULL OR cp.expected_salary_min <= $${values.length})`); }

  if (o.jobType) {
    values.push(o.jobType);
    where.push(`(cp.preferred_job_types IS NULL OR $${values.length} = ANY(cp.preferred_job_types))`);
  }

  const orderBy = SORTS[o.sort] || SORTS.recent;
  values.push(limit); const li = values.length;
  values.push(offset); const oi = values.length;
  const text = `
    SELECT cp.id, cp.slug, cp.headline, cp.role_category, cp.specialty_id,
           cp.experience_years, cp.current_location, cp.expected_salary_min,
           cp.notice_period_days, cp.preferred_job_types, cp.last_active_at,
           di.name_ml AS district_ml, di.name_en AS district_en,
           sp.name_en AS specialty_en
      FROM candidate_profiles cp
      LEFT JOIN districts di ON di.id = cp.district_id
      LEFT JOIN specialties sp ON sp.id = cp.specialty_id
     WHERE ${where.join(' AND ')}
     ORDER BY ${orderBy}
     LIMIT $${li} OFFSET $${oi}`;
  return { text, values, meta: { page, limit } };
}

export { buildCandidateQuery };
