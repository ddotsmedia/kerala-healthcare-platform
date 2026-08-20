// doctorRegister.js — doctor self-registration. Creates a draft/pending doctor
// profile + a verification-queue row for admin review. Never auto-publishes.

import { getPool } from '@khp/db';

const slugify = (s) => String(s || '').toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);

async function one(client, text, values) { return (await client.query(text, values)).rows[0] || null; }

/**
 * @param {object} b full registration payload (all 6 steps)
 * @param {string} [ip]
 * @returns {{ok:true, doctorId, slug}|{error:string}}
 */
export async function registerDoctor(b, ip) {
  const nameEn = String(b.name_en || '').trim();
  const nameMl = String(b.name_ml || '').trim();
  const reg = String(b.registration_number || '').trim();
  if (nameEn.length < 3) return { error: 'name_required' };
  if (!/^[A-Za-z0-9/-]{4,}$/.test(reg)) return { error: 'invalid_registration' };
  if (!b.terms_agreed) return { error: 'terms_required' };

  const parts = nameEn.replace(/^dr\.?\s*/i, '').split(/\s+/);
  const firstName = parts[0] || nameEn;
  const lastName = parts.slice(1).join(' ') || '-';
  const spSlug = Array.isArray(b.specialty_slugs) ? b.specialty_slugs[0] : (b.specialty_slug || '');
  const diSlug = b.district_slug || '';
  const languages = Array.isArray(b.languages) && b.languages.length ? b.languages : ['ml'];
  const years = Number.isFinite(+b.experience_years) ? +b.experience_years : null;
  const fee = Number.isFinite(+b.consultation_fee_inr) ? +b.consultation_fee_inr : null;
  const docs = Array.isArray(b.documents) ? b.documents : [];
  const slug = `dr-${slugify(nameEn.replace(/^dr\.?\s+/i, ''))}-${spSlug || 'doctor'}-${diSlug || 'kerala'}`.slice(0, 120);

  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const sp = spSlug ? await one(client, `SELECT id FROM specialties WHERE slug=$1 AND deleted_at IS NULL`, [spSlug]) : null;
    const di = diSlug ? await one(client, `SELECT id FROM districts WHERE lower(name_en)=lower($1) AND deleted_at IS NULL`, [diSlug]) : null;
    const docArr = docs.map((d) => JSON.stringify({ type: d.type, file_url: d.file_url, uploaded_at: new Date().toISOString() }));

    const doctor = await one(client,
      `INSERT INTO doctors (first_name, last_name, display_name, slug, nmc_registration_no,
          registration_council, specialty_id, district_id, languages, years_experience,
          consultation_fee, about_ml, about_en, photo_url, gender,
          verification_status, listing_status, self_registered, registration_ip,
          registration_documents, registration_payload, last_profile_update)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'pending','draft',true,$16,
          COALESCE((SELECT array_agg(e) FROM jsonb_array_elements($17::jsonb) e), '{}'::jsonb[]),
          $18::jsonb, now())
       ON CONFLICT (slug) DO NOTHING
       RETURNING id, slug`,
      [firstName, lastName, nameEn, slug, reg, b.registration_council || null,
       sp?.id || null, di?.id || null, languages, years, fee,
       b.about_ml || null, b.about_en || null, b.photo_url || null, b.gender || null,
       ip || null, JSON.stringify(docArr.map((s) => JSON.parse(s))), JSON.stringify(b)]);

    if (!doctor) { await client.query('ROLLBACK'); return { error: 'duplicate' }; }

    await client.query(
      `INSERT INTO provider_verifications (provider_type, provider_id, status)
       VALUES ('doctor', $1, 'pending') ON CONFLICT DO NOTHING`, [doctor.id]);
    await client.query(
      `INSERT INTO nmc_verification_checks (provider_id, nmc_registration_number, council, check_method, verified)
       VALUES ($1, $2, $3, 'manual', false)`, [doctor.id, reg, b.registration_council || null]);

    await client.query('COMMIT');
    return { ok: true, doctorId: doctor.id, slug: doctor.slug };
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`doctor self-register failed: ${err.message}`);
    return { error: 'register_failed' };
  } finally {
    client.release();
  }
}
