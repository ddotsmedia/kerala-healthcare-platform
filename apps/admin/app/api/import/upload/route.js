// POST /api/import/upload — multipart CSV (field: file, type). Parses, validates
// headers, stores an import_job with a 5-row preview. Returns { id, preview }.

import { NextResponse } from 'next/server';
import { requireAdminRole } from '@/lib/auth';
import { getSession } from '@/lib/session';
import { parseCSV, IMPORT_COLUMNS } from '@/lib/import';
import { createJob } from '@/lib/importJobs';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  if (!(await requireAdminRole())) {
    return NextResponse.json({ data: null, meta: null, errors: ['forbidden'] }, { status: 403 });
  }
  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  const type = String(form?.get('type') || 'doctors');
  if (!file || typeof file === 'string') {
    return NextResponse.json({ data: null, meta: null, errors: ['file_required'] }, { status: 400 });
  }
  if (!IMPORT_COLUMNS[type]) {
    return NextResponse.json({ data: null, meta: null, errors: ['invalid_type'] }, { status: 400 });
  }
  const text = await file.text();
  const { headers, records } = parseCSV(text);
  if (records.length === 0) {
    return NextResponse.json({ data: null, meta: null, errors: ['empty_csv'] }, { status: 400 });
  }
  const session = await getSession();
  const preview = { headers, rows: records.slice(0, 5), expected: IMPORT_COLUMNS[type] };
  const id = await createJob({
    adminUserId: session?.userId, type, filename: file.name, totalRows: records.length, preview, rawCsv: text
  });
  return NextResponse.json({ data: { id, preview, total: records.length }, meta: null, errors: null }, { status: 201 });
}
