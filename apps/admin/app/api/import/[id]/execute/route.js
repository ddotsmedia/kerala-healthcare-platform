// POST /api/import/[id]/execute — run the import for a stored job. Re-parses the
// stored CSV, imports valid rows (ON CONFLICT DO NOTHING), records per-row errors.
// Returns a JSON summary. (Progress SSE deferred — see BLOCKERS.)

import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { parseCSV, runImport } from '@/lib/import';
import { getJob, finishJob } from '@/lib/importJobs';

export const dynamic = 'force-dynamic';

export async function POST(_request, props) {
  if (!(await requireAdminRole())) {
    return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });
  }
  const { id } = await props.params;
  const job = await getJob(id);
  if (!job) return NextResponse.json({ data: null, meta: null, errors: ['not_found'] }, { status: 404 });
  if (job.status === 'completed') {
    return NextResponse.json({ data: { id, alreadyDone: true }, meta: null, errors: null });
  }
  const { records } = parseCSV(job.raw_csv || '');
  const { success, errorRows, errors } = await runImport(job.type, records);
  await finishJob(id, { success, errorRows, errors, total: records.length });
  return NextResponse.json({
    data: { id, total: records.length, imported: success, errorRows, errors: errors.slice(0, 50) },
    meta: null, errors: null
  }, { status: 200 });
}
