// seed-demo.js — DEMO data only. Safe to run repeatedly (ON CONFLICT DO NOTHING).
// This is the ONLY seed entrypoint (pnpm db:seed:demo). Never a production seed.
// Runs pending migrations first, inserts verified+published demo providers and
// hospitals (10 doctors / 5 districts, 5 hospitals / 2 departments each per
// PHASE_1_SPEC), then populates their search vectors via @khp/search.

import { getPool, closePool } from './pool.js';
import { runMigrations } from './runner.js';
import { doctorVectorUpdate, hospitalVectorUpdate } from '@khp/search';

// first, last, display, slug, nmc, specialty_slug, district_code, languages,
// bio_ml, bio_en, years, fee, modes
const DEMO_DOCTORS = [
  ['Anand', 'Nair', 'Dr. Anand Nair', 'dr-anand-nair-cardiology-ernakulam', 'KL-2011-100201', 'cardiology', 'EKM', ['ml', 'en'], 'ഹൃദ്രോഗ വിദഗ്ധൻ', 'Consultant cardiologist', 15, 500, ['in_person', 'video']],
  ['Meera', 'Pillai', 'Dr. Meera Pillai', 'dr-meera-pillai-pediatrics-thiruvananthapuram', 'KL-2014-100455', 'pediatrics', 'TVM', ['ml', 'en'], 'ശിശുരോഗ വിദഗ്ധ', 'Consultant pediatrician', 11, 400, ['in_person']],
  ['Rahul', 'Menon', 'Dr. Rahul Menon', 'dr-rahul-menon-dermatology-kozhikode', 'KL-2016-100788', 'dermatology', 'KKD', ['ml', 'en'], 'ത്വക്രോഗ വിദഗ്ധൻ', 'Consultant dermatologist', 9, 450, ['in_person', 'video', 'phone']],
  ['Sangeeta', 'Varma', 'Dr. Sangeeta Varma', 'dr-sangeeta-varma-cardiology-thrissur', 'KL-2012-100912', 'cardiology', 'TSR', ['ml', 'en'], 'ഹൃദ്രോഗ വിദഗ്ധ', 'Interventional cardiologist', 13, 600, ['in_person']],
  ['Joseph', 'Kurian', 'Dr. Joseph Kurian', 'dr-joseph-kurian-pediatrics-kottayam', 'KL-2015-101033', 'pediatrics', 'KTM', ['ml', 'en'], 'ശിശുരോഗ വിദഗ്ധൻ', 'Neonatologist', 10, 450, ['in_person', 'video']],
  ['Fathima', 'Beevi', 'Dr. Fathima Beevi', 'dr-fathima-beevi-dermatology-ernakulam', 'KL-2017-101144', 'dermatology', 'EKM', ['ml', 'en'], 'ത്വക്രോഗ വിദഗ്ധ', 'Cosmetic dermatologist', 8, 500, ['in_person', 'video']],
  ['Vinod', 'Raj', 'Dr. Vinod Raj', 'dr-vinod-raj-cardiology-thiruvananthapuram', 'KL-2010-101255', 'cardiology', 'TVM', ['ml', 'en'], 'ഹൃദ്രോഗ വിദഗ്ധൻ', 'Senior cardiologist', 18, 700, ['in_person']],
  ['Lakshmi', 'Devi', 'Dr. Lakshmi Devi', 'dr-lakshmi-devi-pediatrics-kozhikode', 'KL-2018-101366', 'pediatrics', 'KKD', ['ml', 'en'], 'ശിശുരോഗ വിദഗ്ധ', 'Consultant pediatrician', 7, 350, ['in_person', 'phone']],
  ['Thomas', 'Jacob', 'Dr. Thomas Jacob', 'dr-thomas-jacob-dermatology-kottayam', 'KL-2013-101477', 'dermatology', 'KTM', ['ml', 'en'], 'ത്വക്രോഗ വിദഗ്ധൻ', 'Consultant dermatologist', 12, 450, ['in_person', 'video']],
  ['Priya', 'Suresh', 'Dr. Priya Suresh', 'dr-priya-suresh-cardiology-thrissur', 'KL-2019-101588', 'cardiology', 'TSR', ['ml', 'en'], 'ഹൃദ്രോഗ വിദഗ്ധ', 'Consultant cardiologist', 6, 400, ['in_person', 'video']]
];

// name_ml, name_en, slug, type, district_code, reg_no, beds, icu, nicu, emergency, website, desc_ml, desc_en
const DEMO_HOSPITALS = [
  ['ലേക്ഷോർ ആശുപത്രി', 'Lakeshore Hospital', 'lakeshore-hospital-ernakulam', 'private', 'EKM', 'KHReg-EKM-0001', 350, 40, 20, true, 'https://example.com/lakeshore', 'മൾട്ടി സ്പെഷ്യാലിറ്റി', 'Multi-specialty hospital'],
  ['മെഡിക്കൽ ട്രസ്റ്റ്', 'Medical Trust Hospital', 'medical-trust-hospital-thiruvananthapuram', 'private', 'TVM', 'KHReg-TVM-0002', 280, 30, 15, true, 'https://example.com/medtrust', 'മൾട്ടി സ്പെഷ്യാലിറ്റി', 'Multi-specialty hospital'],
  ['ജനറൽ ആശുപത്രി', 'General Hospital Kozhikode', 'general-hospital-kozhikode', 'government', 'KKD', 'KHReg-KKD-0003', 500, 50, 25, true, 'https://example.com/ghkkd', 'സർക്കാർ ആശുപത്രി', 'Government general hospital'],
  ['അമല ആശുപത്രി', 'Amala Hospital', 'amala-hospital-thrissur', 'charitable', 'TSR', 'KHReg-TSR-0004', 600, 60, 30, true, 'https://example.com/amala', 'ചാരിറ്റബിൾ ആശുപത്രി', 'Charitable hospital'],
  ['കാരിത്താസ് ആശുപത്രി', 'Caritas Hospital', 'caritas-hospital-kottayam', 'charitable', 'KTM', 'KHReg-KTM-0005', 450, 45, 22, true, 'https://example.com/caritas', 'ചാരിറ്റബിൾ ആശുപത്രി', 'Charitable hospital']
];

const DEPTS = [['കാർഡിയോളജി', 'Cardiology'], ['പീഡിയാട്രിക്സ്', 'Pediatrics']];

// kind, name_ml, name_en, slug, district_code, about_ml, about_en
const DEMO_FACILITIES = [
  ['clinic', 'സിറ്റി ക്ലിനിക്ക്', 'City Clinic', 'city-clinic-ernakulam', 'EKM', 'പ്രാഥമിക ചികിത്സ', 'Primary care clinic'],
  ['clinic', 'ഫാമിലി ക്ലിനിക്ക്', 'Family Clinic', 'family-clinic-thiruvananthapuram', 'TVM', 'കുടുംബ ചികിത്സ', 'Family care clinic'],
  ['diagnostic_centre', 'മെഡി സ്കാൻ', 'Medi Scan Diagnostics', 'medi-scan-diagnostics-kozhikode', 'KKD', 'ഡയഗ്നോസ്റ്റിക് സെന്റർ', 'Diagnostic centre']
];

async function seedDoctors(pool) {
  for (const d of DEMO_DOCTORS) {
    await pool.query(
      `INSERT INTO doctors
         (first_name,last_name,display_name,name_ml,name_en,slug,type,
          nmc_registration_no,registration_council,nmc_verified,
          verification_status,listing_status,published_at,verified_at,
          specialty_id,district_id,languages,bio_ml,bio_en,about_ml,about_en,
          years_experience,consultation_fee,consultation_modes)
       SELECT $1,$2,$3,$3,$3,$4,'doctor',$5,'NMC',true,
              'verified','published',now(),now(),
              s.id,di.id,$6,$7,$8,$7,$8,$9,$10,$11
         FROM specialties s, districts di
        WHERE s.slug=$12 AND di.code=$13
       ON CONFLICT (slug) DO NOTHING`,
      [d[0], d[1], d[2], d[3], d[4], d[7], d[8], d[9], d[10], d[11], d[12], d[5], d[6]]
    );
  }
}

async function seedHospitals(pool) {
  for (const h of DEMO_HOSPITALS) {
    await pool.query(
      `INSERT INTO hospitals
         (name_ml,name_en,slug,type,verification_status,listing_status,
          published_at,district_id,registration_no,bed_count,icu_beds,nicu_beds,
          emergency_24x7,website,about_ml,about_en)
       SELECT $1,$2,$3,$4,'verified','published',now(),di.id,$5,$6,$7,$8,$9,$10,$11,$12
         FROM districts di WHERE di.code=$13
       ON CONFLICT (slug) DO NOTHING`,
      [h[0], h[1], h[2], h[3], h[5], h[6], h[7], h[8], h[9], h[10], h[11], h[12], h[4]]
    );
  }
}

async function seedDepartments(pool) {
  for (const h of DEMO_HOSPITALS) {
    for (const dep of DEPTS) {
      await pool.query(
        `INSERT INTO hospital_departments (hospital_id, name_ml, name_en)
         SELECT id, $2, $3 FROM hospitals WHERE slug = $1
           AND NOT EXISTS (
             SELECT 1 FROM hospital_departments hd
              WHERE hd.hospital_id = hospitals.id AND hd.name_en = $3
           )`,
        [h[2], dep[0], dep[1]]
      );
    }
  }
}

async function seedFacilities(pool) {
  for (const f of DEMO_FACILITIES) {
    await pool.query(
      `INSERT INTO facilities
         (kind,name_ml,name_en,slug,verification_status,listing_status,published_at,
          district_id,about_ml,about_en)
       SELECT $1,$2,$3,$4,'verified','published',now(),di.id,$5,$6
         FROM districts di WHERE di.code=$7
       ON CONFLICT (slug) DO NOTHING`,
      [f[0], f[1], f[2], f[3], f[5], f[6], f[4]]
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
  await seedDepartments(pool);
  await seedFacilities(pool);
  const counts = await populateVectors(pool);
  console.log(`Demo seed complete. Doctors: ${counts.doctors}, Hospitals: ${counts.hospitals}, Departments: ${DEMO_HOSPITALS.length * DEPTS.length}, Facilities: ${DEMO_FACILITIES.length}.`);
}

main()
  .then(closePool)
  .catch(async (err) => {
    console.error(`Demo seed error: ${err.message}`);
    await closePool();
    process.exit(1);
  });
