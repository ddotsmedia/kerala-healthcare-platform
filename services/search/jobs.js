// jobs.js — parameterised job-listing search. Active listings only by default.

/** Normalise pagination. */
function jobPaginate(page, limit) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  return { page: p, limit: l, offset: (p - 1) * l };
}

const SORTS = {
  newest: 'j.created_at DESC',
  salary_high: 'j.salary_max DESC NULLS LAST, j.created_at DESC',
  salary_low: 'j.salary_min ASC NULLS LAST, j.created_at DESC',
  most_applied: 'j.applications_count DESC, j.created_at DESC',
  closing_soon: 'j.application_deadline ASC NULLS LAST, j.created_at DESC'
};

/**
 * @param {object} o { term, roleCategory, districtId, specialtyId, jobType,
 *   employmentType, experienceYearsMin, experienceYearsMax, salaryMin, salaryMax,
 *   isRemote, isUrgent, qualification, postedAfter, sort, status, page, limit }
 */
function buildJobQuery(o = {}) {
  const { offset, limit, page } = jobPaginate(o.page, o.limit);
  const where = ['j.deleted_at IS NULL'];
  const values = [];
  const eq = (val, expr) => { if (val != null && val !== '') { values.push(val); where.push(`${expr} = $${values.length}`); } };
  const num = (val) => { const n = parseInt(val, 10); return Number.isFinite(n) ? n : null; };

  eq(o.status || 'active', 'j.status');
  if (o.term) {
    values.push(`%${o.term}%`);
    where.push(`(j.title ILIKE $${values.length} OR j.description ILIKE $${values.length} OR j.role_category ILIKE $${values.length})`);
  }
  eq(o.roleCategory, 'j.role_category');
  eq(o.districtId, 'j.district_id');
  eq(o.specialtyId, 'j.specialty_id');
  eq(o.jobType, 'j.job_type');
  eq(o.employmentType, 'j.employment_type');

  const expMin = num(o.experienceYearsMin);
  if (expMin != null) { values.push(expMin); where.push(`j.experience_years_min <= $${values.length}`); }
  const expMax = num(o.experienceYearsMax);
  if (expMax != null) { values.push(expMax); where.push(`j.experience_years_min >= $${values.length}`); }

  const salMin = num(o.salaryMin);
  if (salMin != null) { values.push(salMin); where.push(`(j.salary_max IS NULL OR j.salary_max >= $${values.length})`); }
  const salMax = num(o.salaryMax);
  if (salMax != null) { values.push(salMax); where.push(`(j.salary_min IS NULL OR j.salary_min <= $${values.length})`); }

  if (o.isRemote === true || o.isRemote === 'true' || o.isRemote === '1') where.push('j.is_remote = true');
  if (o.isUrgent === true || o.isUrgent === 'true' || o.isUrgent === '1') where.push('j.is_urgent = true');

  if (o.qualification) {
    values.push(Array.isArray(o.qualification) ? o.qualification : [o.qualification]);
    where.push(`j.qualification_required && $${values.length}::text[]`);
  }
  if (o.postedAfter) { values.push(o.postedAfter); where.push(`j.created_at >= $${values.length}`); }

  const orderBy = SORTS[o.sort] || SORTS.newest;
  values.push(limit); const li = values.length;
  values.push(offset); const oi = values.length;
  const text = `
    SELECT j.id, j.slug, j.title, j.role_category, j.employment_type, j.job_type,
           j.experience_years_min, j.experience_years_max, j.salary_min, j.salary_max,
           j.salary_period, j.is_remote, j.is_urgent, j.application_deadline,
           j.views_count, j.applications_count, j.created_at,
           e.org_name, e.logo_url,
           di.name_ml AS district_ml, di.name_en AS district_en
      FROM job_listings j
      JOIN employer_profiles e ON e.id = j.employer_id
      LEFT JOIN districts di ON di.id = j.district_id
     WHERE ${where.join(' AND ')}
     ORDER BY ${orderBy}
     LIMIT $${li} OFFSET $${oi}`;
  return { text, values, meta: { page, limit } };
}

export { buildJobQuery, jobPaginate };
