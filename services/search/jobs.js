// jobs.js — parameterised job-listing search. Active listings only by default.

/** Normalise pagination. */
function jobPaginate(page, limit) {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
  return { page: p, limit: l, offset: (p - 1) * l };
}

/**
 * @param {object} o { term, roleCategory, districtId, specialtyId,
 *                     employmentType, experienceYearsMin, status, page, limit }
 * @returns {{ text:string, values:any[], meta:object }}
 */
function buildJobQuery(o = {}) {
  const { offset, limit, page } = jobPaginate(o.page, o.limit);
  const where = ['j.deleted_at IS NULL'];
  const values = [];
  const eq = (val, expr) => { if (val != null && val !== '') { values.push(val); where.push(`${expr} = $${values.length}`); } };

  eq(o.status || 'active', 'j.status');
  if (o.term) {
    values.push(`%${o.term}%`);
    where.push(`(j.title ILIKE $${values.length} OR j.role_category ILIKE $${values.length})`);
  }
  eq(o.roleCategory, 'j.role_category');
  eq(o.districtId, 'j.district_id');
  eq(o.specialtyId, 'j.specialty_id');
  eq(o.employmentType, 'j.employment_type');
  if (o.experienceYearsMin != null && o.experienceYearsMin !== '') {
    values.push(parseInt(o.experienceYearsMin, 10) || 0);
    where.push(`j.experience_years_min <= $${values.length}`);
  }

  values.push(limit); const li = values.length;
  values.push(offset); const oi = values.length;
  const text = `
    SELECT j.id, j.slug, j.title, j.role_category, j.employment_type,
           j.experience_years_min, j.salary_min, j.salary_max, j.created_at,
           e.org_name, e.logo_url,
           di.name_ml AS district_ml, di.name_en AS district_en
      FROM job_listings j
      JOIN employer_profiles e ON e.id = j.employer_id
      LEFT JOIN districts di ON di.id = j.district_id
     WHERE ${where.join(' AND ')}
     ORDER BY j.created_at DESC
     LIMIT $${li} OFFSET $${oi}`;
  return { text, values, meta: { page, limit } };
}

export { buildJobQuery, jobPaginate };
