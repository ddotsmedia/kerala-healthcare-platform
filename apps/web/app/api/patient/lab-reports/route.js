// GET  /api/patient/lab-reports?q= — list (metadata + results, no file blob)
// POST /api/patient/lab-reports — multipart upload (file + metadata + results)
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { listLabReports, createLabReport, MAX_FILE_KB, FILE_TYPES } from '@/lib/labReports';

export const dynamic = 'force-dynamic';

function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }
function safeJson(v) { if (!v) return undefined; try { return JSON.parse(v); } catch { return undefined; } }

export async function GET(request) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const { searchParams } = new URL(request.url);
  const rows = await listLabReports(uid, searchParams.get('q') || '');
  return NextResponse.json({ data: rows, meta: { count: rows.length }, errors: null });
}

export async function POST(request) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const ct = request.headers.get('content-type') || '';
  let b = {}, fileMeta = {};

  if (ct.includes('multipart/form-data')) {
    const form = await request.formData();
    const file = form.get('file');
    if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
      const type = FILE_TYPES[file.type];
      if (!type) return err('invalid_file_type', 400);
      const sizeKb = Math.ceil(file.size / 1024);
      if (sizeKb > MAX_FILE_KB) return err('file_too_large', 400);
      const buf = Buffer.from(await file.arrayBuffer());
      fileMeta = { file_data_uri: `data:${file.type};base64,${buf.toString('base64')}`,
        file_name: (file.name || `lab-report.${type}`).slice(0, 200), file_type: type, file_size_kb: sizeKb };
    }
    b = {
      lab_name: form.get('lab_name'), report_date: form.get('report_date'), report_type: form.get('report_type'),
      ordered_by_doctor: form.get('ordered_by_doctor'), notes: form.get('notes'), results: safeJson(form.get('results'))
    };
  } else {
    b = await request.json().catch(() => ({}));
  }

  if (!b.report_date) return err('report_date_required', 400);
  const row = await createLabReport(uid, { ...b, ...fileMeta });
  if (!row) return err('create_failed', 400);
  return NextResponse.json({ data: row, meta: null, errors: null }, { status: 201 });
}
