// GET  /api/patient/prescriptions?q= — list (metadata only)
// POST /api/patient/prescriptions — multipart upload (file + metadata)
import { NextResponse } from 'next/server';
import { currentPatientId } from '@/lib/appointments';
import { listPrescriptions, createPrescription, MAX_FILE_KB, FILE_TYPES } from '@/lib/prescriptions';
import { ownsFamilyMember } from '@/lib/family';

export const dynamic = 'force-dynamic';

function err(msg, status) { return NextResponse.json({ data: null, meta: null, errors: [msg] }, { status }); }

export async function GET(request) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);
  const { searchParams } = new URL(request.url);
  const rows = await listPrescriptions(uid, searchParams.get('q') || '', searchParams.get('member') || null);
  return NextResponse.json({ data: rows, meta: { count: rows.length }, errors: null });
}

export async function POST(request) {
  const uid = await currentPatientId();
  if (!uid) return err('unauthenticated', 401);

  const ct = request.headers.get('content-type') || '';
  let b = {};
  let fileMeta = {};
  if (ct.includes('multipart/form-data')) {
    const form = await request.formData();
    const file = form.get('file');
    if (file && typeof file.arrayBuffer === 'function' && file.size > 0) {
      const type = FILE_TYPES[file.type];
      if (!type) return err('invalid_file_type', 400);
      const sizeKb = Math.ceil(file.size / 1024);
      if (sizeKb > MAX_FILE_KB) return err('file_too_large', 400);
      const buf = Buffer.from(await file.arrayBuffer());
      fileMeta = {
        file_data_uri: `data:${file.type};base64,${buf.toString('base64')}`,
        file_name: (file.name || `prescription.${type}`).slice(0, 200), file_type: type, file_size_kb: sizeKb
      };
    }
    b = {
      doctor_name: form.get('doctor_name'), hospital_name: form.get('hospital_name'),
      prescribed_date: form.get('prescribed_date'), valid_until: form.get('valid_until'),
      notes: form.get('notes'), appointment_id: form.get('appointment_id') || null,
      family_member_id: form.get('family_member_id') || null,
      medications: safeJson(form.get('medications')), tags: safeJson(form.get('tags'))
    };
  } else {
    b = await request.json().catch(() => ({}));
  }

  if (!b.doctor_name && !fileMeta.file_data_uri && !(Array.isArray(b.medications) && b.medications.length)) {
    return err('empty_prescription', 400);
  }
  if (b.family_member_id && !(await ownsFamilyMember(uid, b.family_member_id))) return err('invalid_member', 403);
  const row = await createPrescription(uid, { ...b, ...fileMeta });
  if (!row) return err('create_failed', 400);
  return NextResponse.json({ data: row, meta: null, errors: null }, { status: 201 });
}

function safeJson(v) { if (!v) return undefined; try { return JSON.parse(v); } catch { return undefined; } }
