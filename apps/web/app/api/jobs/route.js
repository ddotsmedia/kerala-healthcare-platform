// POST /api/jobs — employer posts a new job listing.
// After the row is saved, fire matchJobToAlerts() so 'instant' alerts email out.
import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getPool } from '@khp/db';
import { currentEmployerProfile } from '@/lib/jobs';
import { matchJobToAlerts } from '@khp/jobs';

export const dynamic = 'force-dynamic';

const EMPLOYMENT = ['full_time', 'part_time', 'contract', 'locum'];
const JOB_TYPES = ['full_time', 'part_time', 'contract', 'locum', 'internship'];

function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

function slugify(title) {
  const base = String(title).toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 60) || 'job';
  return `${base}-${randomBytes(4).toString('hex')}`;
}

function toInt(v) { const n = parseInt(v, 10); return Number.isFinite(n) ? n : null; }

export async function POST(request) {
  const emp = await currentEmployerProfile();
  if (!emp) return err('not_an_employer', 403);
  let b;
  try { b = await request.json(); } catch { return err('invalid_json', 400); }
  const title = (b.title || '').toString().trim();
  if (!title) return err('title_required', 400);

  const jobType = JOB_TYPES.includes(b.job_type) ? b.job_type : 'full_time';
  const employment = EMPLOYMENT.includes(b.employment_type) ? b.employment_type
    : (EMPLOYMENT.includes(jobType) ? jobType : 'full_time');

  try {
    const { rows } = await getPool().query(
      `INSERT INTO job_listings
         (slug, employer_id, title, role_category, specialty_id, description, requirements,
          district_id, employment_type, job_type, experience_years_min, experience_years_max,
          salary_min, salary_max, salary_period, is_remote, is_urgent, application_deadline, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [slugify(title), emp.id, title, b.role_category || null, b.specialty_id || null,
       b.description || null, b.requirements || null, b.district_id || null,
       employment, jobType, toInt(b.experience_years_min) ?? 0, toInt(b.experience_years_max),
       toInt(b.salary_min), toInt(b.salary_max), b.salary_period || 'monthly',
       b.is_remote === true, b.is_urgent === true, b.application_deadline || null,
       b.status === 'draft' ? 'draft' : 'active']);
    const job = rows[0];
    let alerts = { matched: 0, sent: 0 };
    if (job.status === 'active') {
      try { alerts = await matchJobToAlerts(job); }
      catch (e) { console.error(`matchJobToAlerts failed: ${e.message}`); }
    }
    return NextResponse.json({ data: { id: job.id, slug: job.slug, status: job.status }, meta: { alerts }, errors: null }, { status: 201 });
  } catch (e) {
    return err(`create_failed:${e.message.slice(0, 80)}`, 400);
  }
}
