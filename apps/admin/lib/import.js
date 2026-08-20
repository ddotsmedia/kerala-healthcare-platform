// import.js — bulk provider CSV import. No external CSV package (hand-rolled).
// Validates each row, reports errors without stopping, inserts valid rows with
// ON CONFLICT DO NOTHING. Imported providers start unverified + draft (NMC rule).

import { getPool } from '@khp/db';

const DOCTOR_COLUMNS = ['name_en', 'name_ml', 'registration_number', 'registration_council',
  'specialty_slugs', 'district_slug', 'consultation_modes', 'languages', 'experience_years',
  'consultation_fee_inr', 'phone', 'email'];
const HOSPITAL_COLUMNS = ['name_en', 'name_ml', 'type', 'district_slug', 'address_en', 'address_ml',
  'phone', 'email', 'website', 'bed_count', 'icu_beds', 'services'];

export const IMPORT_COLUMNS = { doctors: DOCTOR_COLUMNS, hospitals: HOSPITAL_COLUMNS };

/** Parse a CSV string into an array of row objects keyed by header. Handles quotes. */
export function parseCSV(text) {
  const rows = [];
  let field = '', row = [], inQuotes = false;
  const s = String(text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (inQuotes) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i += 1; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  const nonEmpty = rows.filter((r) => r.some((v) => String(v).trim() !== ''));
  if (nonEmpty.length === 0) return { headers: [], records: [] };
  const headers = nonEmpty[0].map((h) => String(h).trim());
  const records = nonEmpty.slice(1).map((r) => {
    const obj = {};
    headers.forEach((h, idx) => { obj[h] = (r[idx] ?? '').trim(); });
    return obj;
  });
  return { headers, records };
}

const list = (v) => String(v || '').split(',').map((x) => x.trim()).filter(Boolean);
const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);

async function run(text, values) {
  try { return (await getPool().query(text, values)).rows; }
  catch (err) { throw err; }
}

async function specialtyId(slug) {
  const r = await run(`SELECT id FROM specialties WHERE slug = $1 AND deleted_at IS NULL`, [slug]);
  return r[0]?.id || null;
}
async function districtId(slug) {
  const r = await run(`SELECT id FROM districts WHERE lower(name_en) = lower($1) AND deleted_at IS NULL`, [slug]);
  return r[0]?.id || null;
}

/** Validate + insert one doctor row. @returns {ok:true}|{error:{field,error_message}} */
async function importDoctorRow(rec) {
  const nameEn = (rec.name_en || '').trim();
  if (nameEn.length < 3) return { error: { field: 'name_en', error_message: 'Name is required' } };
  const reg = (rec.registration_number || '').trim();
  if (!/^[A-Za-z0-9/-]{4,}$/.test(reg)) return { error: { field: 'registration_number', error_message: 'Invalid registration number' } };
  const parts = nameEn.replace(/^dr\.?\s*/i, '').split(/\s+/);
  const firstName = parts[0] || nameEn;
  const lastName = parts.slice(1).join(' ') || '-';
  const spSlug = list(rec.specialty_slugs)[0] || '';
  const spId = spSlug ? await specialtyId(spSlug) : null;
  const diId = rec.district_slug ? await districtId(rec.district_slug) : null;
  const langs = list(rec.languages); const languages = langs.length ? langs : ['ml'];
  const years = parseInt(rec.experience_years, 10); const yrs = Number.isFinite(years) ? years : null;
  const fee = parseFloat(rec.consultation_fee_inr); const feeVal = Number.isFinite(fee) ? fee : null;
  const slug = `dr-${slugify(nameEn)}-${spSlug || 'doctor'}-${rec.district_slug || 'kerala'}`.slice(0, 120);
  const rows = await run(
    `INSERT INTO doctors (first_name, last_name, display_name, slug, nmc_registration_no,
        specialty_id, district_id, languages, years_experience, consultation_fee,
        verification_status, listing_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending','draft')
     ON CONFLICT (slug) DO NOTHING RETURNING id`,
    [firstName, lastName, nameEn, slug, reg, spId, diId, languages, yrs, feeVal]);
  return rows[0] ? { ok: true } : { ok: true, skipped: true };
}

/** Validate + insert one hospital row. */
async function importHospitalRow(rec) {
  const nameEn = (rec.name_en || '').trim();
  if (nameEn.length < 3) return { error: { field: 'name_en', error_message: 'Name is required' } };
  const diId = rec.district_slug ? await districtId(rec.district_slug) : null;
  const beds = parseInt(rec.bed_count, 10); const bedVal = Number.isFinite(beds) ? beds : null;
  const slug = `${slugify(nameEn)}-${rec.district_slug || 'kerala'}`.slice(0, 120);
  const rows = await run(
    `INSERT INTO hospitals (name_en, name_ml, slug, type, district_id, address_en, address_ml,
        bed_count, registration_no, verification_status, listing_status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending','draft')
     ON CONFLICT (slug) DO NOTHING RETURNING id`,
    [nameEn, rec.name_ml || nameEn, slug, rec.type || null, diId, rec.address_en || null,
     rec.address_ml || null, bedVal, rec.website || null]);
  return rows[0] ? { ok: true } : { ok: true, skipped: true };
}

/** Run the import for a parsed record set. Returns { success, errorRows, errors }. */
export async function runImport(type, records) {
  const importer = type === 'hospitals' ? importHospitalRow : importDoctorRow;
  let success = 0; const errors = [];
  for (let i = 0; i < records.length; i += 1) {
    try {
      const r = await importer(records[i]);
      if (r.error) errors.push({ row: i + 2, ...r.error });
      else success += 1; // includes ON CONFLICT skips (counted as processed-ok)
    } catch (err) {
      errors.push({ row: i + 2, field: '-', error_message: err.message.slice(0, 200) });
    }
  }
  return { success, errorRows: errors.length, errors };
}

/** Template CSV text with correct headers + one example row. */
export function templateCSV(type) {
  if (type === 'hospitals') {
    return `${HOSPITAL_COLUMNS.join(',')}\n"City Care Hospital","സിറ്റി കെയർ","private","Ernakulam","MG Road, Kochi","എം.ജി റോഡ്","+914840000000","info@example.com","https://example.com","120","15","lab,mri,icu"\n`;
  }
  return `${DOCTOR_COLUMNS.join(',')}\n"Dr Anil Kumar","ഡോ. അനിൽ കുമാർ","KMC12345","KMC","cardiology","Ernakulam","in_person,video","ml,en","12","500","+919000000000","anil@example.com"\n`;
}
