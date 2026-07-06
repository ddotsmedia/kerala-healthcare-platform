// POST /api/jobs/alerts/[id]/test — send a test email for this alert now.
import { NextResponse } from 'next/server';
import { getPool } from '@khp/db';
import { getMyAlert } from '@/lib/jobs';
import { filterMatchesJob, sendJobAlertEmail } from '@khp/jobs';

export const dynamic = 'force-dynamic';

function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

async function recentJobs() {
  try {
    const { rows } = await getPool().query(
      `SELECT j.id, j.slug, j.title, j.role_category, j.specialty_id, j.district_id,
              j.job_type, j.employment_type, j.description, j.salary_min, j.salary_max,
              j.salary_period, j.is_remote, j.is_urgent,
              e.org_name, di.name_ml AS district_ml, di.name_en AS district_en
         FROM job_listings j
         JOIN employer_profiles e ON e.id = j.employer_id
         LEFT JOIN districts di ON di.id = j.district_id
        WHERE j.status = 'active' AND j.deleted_at IS NULL
        ORDER BY j.created_at DESC LIMIT 50`);
    return rows;
  } catch { return []; }
}

export async function POST(request, ctx) {
  const { id } = await ctx.params;
  const alert = await getMyAlert(id);
  if (!alert) return err('not_found', 404);
  const jobs = (await recentJobs()).filter((j) => filterMatchesJob(alert.filters, j)).slice(0, 5);
  const res = await sendJobAlertEmail(alert.user_id, alert, jobs.length ? jobs : (await recentJobs()).slice(0, 3));
  return NextResponse.json({ data: { test: true, matched: jobs.length, status: res.status }, meta: null, errors: null });
}
