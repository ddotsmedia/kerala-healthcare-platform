// seed-demo.js — DEMO data only. Safe to run repeatedly (ON CONFLICT DO NOTHING).
// This is the ONLY seed entrypoint (pnpm db:seed:demo). Never a production seed.
// Runs pending migrations first, inserts verified+published demo providers,
// then populates their search vectors via @khp/search.

import { getPool, closePool } from './pool.js';
import { runMigrations } from './runner.js';
import { doctorVectorUpdate, hospitalVectorUpdate } from '@khp/search';

const DEMO_DOCTORS = [
  // first, last, display, slug, nmc_no, specialty_slug, district_code, languages, about_ml, about_en, years, fee
  ['Anand', 'Nair', 'Dr. Anand Nair', 'dr-anand-nair-cardiology-ernakulam', 'KL-2011-100201', 'cardiology', 'EKM', ['ml', 'en'], 'ഹൃദ്രോഗ വിദഗ്ധൻ', 'Consultant cardiologist', 15, 500],
  ['Meera', 'Pillai', 'Dr. Meera Pillai', 'dr-meera-pillai-pediatrics-thiruvananthapuram', 'KL-2014-100455', 'pediatrics', 'TVM', ['ml', 'en'], 'ശിശുരോഗ വിദഗ്ധ', 'Consultant pediatrician', 11, 400],
  ['Rahul', 'Menon', 'Dr. Rahul Menon', 'dr-rahul-menon-dermatology-kozhikode', 'KL-2016-100788', 'dermatology', 'KKD', ['ml', 'en'], 'ത്വക്രോഗ വിദഗ്ധൻ', 'Consultant dermatologist', 9, 450]
];

const DEMO_HOSPITALS = [
  // name_ml, name_en, slug, district_code, reg_no, beds, emergency, about_ml, about_en
  ['ലേക്ഷോർ ആശുപത്രി', 'Lakeshore Hospital', 'lakeshore-hospital-ernakulam', 'EKM', 'KHReg-EKM-0001', 350, true, 'മൾട്ടി സ്പെഷ്യാലിറ്റി ആശുപത്രി', 'Multi-specialty hospital'],
  ['മെഡിക്കൽ ട്രസ്റ്റ്', 'Medical Trust Hospital', 'medical-trust-hospital-thiruvananthapuram', 'TVM', 'KHReg-TVM-0002', 280, true, 'മൾട്ടി സ്പെഷ്യാലിറ്റി ആശുപത്രി', 'Multi-specialty hospital']
];

async function seedDoctors(pool) {
  for (const d of DEMO_DOCTORS) {
    await pool.query(
      `INSERT INTO doctors
         (first_name,last_name,display_name,slug,nmc_registration_no,nmc_verified,
          verification_status,listing_status,published_at,specialty_id,district_id,
          languages,about_ml,about_en,years_experience,consultation_fee)
       SELECT $1,$2,$3,$4,$5,true,'verified','published',now(),s.id,di.id,$6,$7,$8,$9,$10
         FROM specialties s, districts di
        WHERE s.slug=$11 AND di.code=$12
       ON CONFLICT (slug) DO NOTHING`,
      [d[0], d[1], d[2], d[3], d[4], d[7], d[8], d[9], d[10], d[11], d[5], d[6]]
    );
  }
}

async function seedHospitals(pool) {
  for (const h of DEMO_HOSPITALS) {
    await pool.query(
      `INSERT INTO hospitals
         (name_ml,name_en,slug,verification_status,listing_status,published_at,
          district_id,registration_no,bed_count,emergency_24x7,about_ml,about_en)
       SELECT $1,$2,$3,'verified','published',now(),di.id,$4,$5,$6,$7,$8
         FROM districts di WHERE di.code=$9
       ON CONFLICT (slug) DO NOTHING`,
      [h[0], h[1], h[2], h[4], h[5], h[6], h[7], h[8], h[3]]
    );
  }
}

async function populateVectors(pool) {
  const docs = await pool.query(
    `SELECT id,display_name,about_ml,about_en FROM doctors WHERE slug = ANY($1)`,
    [DEMO_DOCTORS.map((d) => d[3])]
  );
  for (const row of docs.rows) {
    const u = doctorVectorUpdate(row);
    await pool.query(u.text, u.values);
  }
  const hosps = await pool.query(
    `SELECT id,name_ml,name_en,about_ml,about_en FROM hospitals WHERE slug = ANY($1)`,
    [DEMO_HOSPITALS.map((h) => h[2])]
  );
  for (const row of hosps.rows) {
    const u = hospitalVectorUpdate(row);
    await pool.query(u.text, u.values);
  }
  return { doctors: docs.rowCount, hospitals: hosps.rowCount };
}

async function main() {
  const pool = getPool();
  await runMigrations(pool);
  await seedDoctors(pool);
  await seedHospitals(pool);
  const counts = await populateVectors(pool);
  console.log(`Demo seed complete. Doctors present: ${counts.doctors}, Hospitals present: ${counts.hospitals}.`);
}

main()
  .then(closePool)
  .catch(async (err) => {
    console.error(`Demo seed error: ${err.message}`);
    await closePool();
    process.exit(1);
  });
