// GET /api/employer/candidates — recruiter candidate search (employer auth).
// No contact fields returned. Every search is audit-logged.
import { NextResponse } from 'next/server';
import { searchCandidates } from '@/lib/recruiter';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const g = (k) => searchParams.get(k) || '';
  const filters = {
    term: g('q'), roleCategory: g('role'), specialtyId: g('specialty'), districtId: g('district'),
    jobType: g('job_type'), experienceYearsMin: g('exp_min'), experienceYearsMax: g('exp_max'),
    expectedSalaryMax: g('salary_max')
  };
  const opts = { ...filters, sort: g('sort') || 'recent', page: g('page') || 1, limit: 20, filters };
  const res = await searchCandidates(opts);
  if (res === null) return NextResponse.json({ data: null, meta: null, errors: ['not_an_employer'] }, { status: 403 });
  return NextResponse.json({ data: res.rows, meta: { count: res.rows.length }, errors: null });
}
