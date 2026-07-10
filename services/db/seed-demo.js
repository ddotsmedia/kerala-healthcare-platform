// seed-demo.js — DEMO data only. Safe to run repeatedly (ON CONFLICT DO NOTHING).
// This is the ONLY seed entrypoint (pnpm db:seed:demo). Never a production seed.
// Runs pending migrations first, inserts verified+published demo providers and
// hospitals (10 doctors / 5 districts, 5 hospitals / 2 departments each per
// PHASE_1_SPEC), then populates their search vectors via @khp/search.

import { createHash } from 'node:crypto';
import { getPool, closePool } from './pool.js';
import { runMigrations } from './runner.js';
import { doctorVectorUpdate, hospitalVectorUpdate } from '@khp/search';

// Peppered mobile hash — MUST match @khp/auth crypto.pepperedHash.
const AUTH_PEPPER = process.env.AUTH_PEPPER || process.env.JWT_SECRET || 'dev-pepper';
const mobileHash = (m) => createHash('sha256').update(`${m}:${AUTH_PEPPER}`).digest('hex');

// Demo login numbers (dev only).
const DEMO_LOGINS = { patient: '9999000003', doctor: '9999000001', admin: '9999000002', editor: '9999000004', employer: '9999000005', candidate: '9999000006' };

// [org_name, org_type, district_code]
const EMPLOYERS = [
  ['Lakeshore Hospital', 'hospital', 'EKM'],
  ['Medical Trust Hospital', 'hospital', 'TVM'],
  ['Amala Hospital', 'hospital', 'TSR']
];
// [slug, employer_org, title, role_category, district_code, employment_type, exp_min]
const JOBS = [
  ['staff-nurse-ekm-lakeshore', 'Lakeshore Hospital', 'Staff Nurse', 'nurse', 'EKM', 'full_time', 1],
  ['icu-nurse-ekm-lakeshore', 'Lakeshore Hospital', 'ICU Nurse', 'nurse', 'EKM', 'full_time', 3],
  ['physician-ekm-lakeshore', 'Lakeshore Hospital', 'Consultant Physician', 'doctor', 'EKM', 'full_time', 5],
  ['lab-technician-tvm-medtrust', 'Medical Trust Hospital', 'Lab Technician', 'technician', 'TVM', 'full_time', 2],
  ['pharmacist-tvm-medtrust', 'Medical Trust Hospital', 'Pharmacist', 'pharmacist', 'TVM', 'part_time', 1],
  ['radiographer-tvm-medtrust', 'Medical Trust Hospital', 'Radiographer', 'technician', 'TVM', 'contract', 2],
  ['physiotherapist-tsr-amala', 'Amala Hospital', 'Physiotherapist', 'physiotherapist', 'TSR', 'full_time', 2],
  ['pediatric-nurse-tsr-amala', 'Amala Hospital', 'Pediatric Nurse', 'nurse', 'TSR', 'full_time', 2],
  ['locum-doctor-tsr-amala', 'Amala Hospital', 'Locum Doctor', 'doctor', 'TSR', 'locum', 4],
  ['receptionist-ekm-lakeshore', 'Lakeshore Hospital', 'Front Desk Receptionist', 'admin', 'EKM', 'part_time', 0]
];
// [slug, role_category, district_code, exp, headline]
const CANDIDATES = [
  ['nurse-arya-ekm', 'nurse', 'EKM', 4, 'Experienced staff nurse'],
  ['doctor-bijoy-tvm', 'doctor', 'TVM', 8, 'General physician'],
  ['technician-chithra-tsr', 'technician', 'TSR', 3, 'Lab technician'],
  ['pharmacist-deepa-ekm', 'pharmacist', 'EKM', 5, 'Registered pharmacist'],
  ['physio-eldho-ktm', 'physiotherapist', 'KTM', 2, 'Physiotherapist']
];

async function seedJobs(pool) {
  for (const [org, type, dist] of EMPLOYERS) {
    await pool.query(
      `INSERT INTO employer_profiles (org_name, org_type, district_id, verified)
       SELECT $1::text,$2::text,di.id,true FROM districts di WHERE di.code=$3
        AND NOT EXISTS (SELECT 1 FROM employer_profiles WHERE org_name=$1)`,
      [org, type, dist]);
  }
  // Link demo employer login to the first employer.
  await pool.query(
    `UPDATE employer_profiles SET user_id = (SELECT id FROM users WHERE mobile_hash=$1)
      WHERE org_name='Lakeshore Hospital' AND user_id IS NULL`,
    [mobileHash(DEMO_LOGINS.employer)]);

  for (const [slug, org, title, role, dist, etype, exp] of JOBS) {
    await pool.query(
      `INSERT INTO job_listings
         (slug, employer_id, title, role_category, description, requirements,
          district_id, employment_type, experience_years_min, status)
       SELECT $1::varchar, e.id, $3::text, $4::varchar, $3::text || ' at ' || e.org_name, 'See job description',
              di.id, $5::varchar, $6::int, 'active'
         FROM employer_profiles e, districts di
        WHERE e.org_name=$2 AND di.code=$7
        AND NOT EXISTS (SELECT 1 FROM job_listings WHERE slug=$1)`,
      [slug, org, title, role, etype, exp, dist]);
  }

  for (const [slug, role, dist, exp, headline] of CANDIDATES) {
    await pool.query(
      `INSERT INTO candidate_profiles
         (slug, role_category, district_id, experience_years, headline, summary)
       SELECT $1::varchar,$2::varchar,di.id,$3::int,$4::text,$4::text FROM districts di WHERE di.code=$5
        AND NOT EXISTS (SELECT 1 FROM candidate_profiles WHERE slug=$1)`,
      [slug, role, exp, headline, dist]);
  }
  // Link demo candidate login to the first candidate.
  await pool.query(
    `UPDATE candidate_profiles SET user_id = (SELECT id FROM users WHERE mobile_hash=$1)
      WHERE slug='nurse-arya-ekm' AND user_id IS NULL`,
    [mobileHash(DEMO_LOGINS.candidate)]);
}

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
  ['Priya', 'Suresh', 'Dr. Priya Suresh', 'dr-priya-suresh-cardiology-thrissur', 'KL-2019-101588', 'cardiology', 'TSR', ['ml', 'en'], 'ഹൃദ്രോഗ വിദഗ്ധ', 'Consultant cardiologist', 6, 400, ['in_person', 'video']],
  ['Gopalan', 'Vaidyan', 'Dr. Gopalan Vaidyan', 'dr-gopalan-vaidyan-general-physician-kottayam', 'KL-2009-100099', 'general-physician', 'KTM', ['ml', 'en'], 'ആയുർവേദ വൈദ്യൻ ക്ലിനിക്ക് ചികിത്സ ഗർഭിണി കുട്ടികൾ', 'Ayurveda physician clinic', 20, 300, ['in_person']]
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

// [slug, title_ml, title_en] — content seed sets.
const DISEASES = [
  ['diabetes', 'പ്രമേഹം', 'Diabetes'], ['hypertension', 'രക്തസമ്മർദ്ദം', 'Hypertension'],
  ['asthma', 'ആസ്ത്മ', 'Asthma'], ['dengue', 'ഡെങ്കിപ്പനി', 'Dengue'],
  ['tuberculosis', 'ക്ഷയരോഗം', 'Tuberculosis'], ['malaria', 'മലേറിയ', 'Malaria'],
  ['anemia', 'വിളർച്ച', 'Anemia'], ['migraine', 'കൊടിഞ്ഞി', 'Migraine'],
  ['arthritis', 'സന്ധിവാതം', 'Arthritis'], ['thyroid-disorder', 'തൈറോയ്ഡ് തകരാറ്', 'Thyroid Disorder'],
  ['jaundice', 'മഞ്ഞപ്പിത്തം', 'Jaundice'], ['typhoid', 'ടൈഫോയ്ഡ്', 'Typhoid'],
  ['pneumonia', 'ന്യുമോണിയ', 'Pneumonia'], ['gastritis', 'ഗ്യാസ്ട്രൈറ്റിസ്', 'Gastritis'],
  ['dermatitis', 'ത്വക്ക് വീക്കം', 'Dermatitis'], ['conjunctivitis', 'ചെങ്കണ്ണ്', 'Conjunctivitis'],
  ['sinusitis', 'സൈനസൈറ്റിസ്', 'Sinusitis'], ['bronchitis', 'ബ്രോങ്കൈറ്റിസ്', 'Bronchitis'],
  ['chickenpox', 'ചിക്കൻപോക്സ്', 'Chickenpox'], ['hepatitis', 'ഹെപ്പറ്റൈറ്റിസ്', 'Hepatitis']
];
const ARTICLES = [
  ['healthy-eating-kerala', 'ആരോഗ്യകരമായ ഭക്ഷണം', 'Healthy Eating in Kerala'],
  ['monsoon-health-tips', 'മഴക്കാല ആരോഗ്യ നുറുങ്ങുകൾ', 'Monsoon Health Tips'],
  ['managing-diabetes-daily', 'പ്രമേഹ പരിചരണം', 'Managing Diabetes Daily'],
  ['heart-health-basics', 'ഹൃദയാരോഗ്യം', 'Heart Health Basics'],
  ['child-vaccination-guide', 'കുട്ടികളുടെ വാക്സിനേഷൻ', 'Child Vaccination Guide'],
  ['mental-wellbeing', 'മാനസികാരോഗ്യം', 'Mental Wellbeing'],
  ['womens-health', 'സ്ത്രീകളുടെ ആരോഗ്യം', "Women's Health"],
  ['elderly-care', 'വയോജന പരിചരണം', 'Elderly Care'],
  ['first-aid-basics', 'പ്രഥമശുശ്രൂഷ', 'First Aid Basics'],
  ['staying-active', 'ശാരീരിക പ്രവർത്തനം', 'Staying Active']
];
const PROCEDURES = [
  ['blood-test-guide', 'രക്തപരിശോധന', 'Blood Test Guide'],
  ['x-ray-procedure', 'എക്സ്റേ', 'X-Ray Procedure'],
  ['echocardiogram', 'എക്കോകാർഡിയോഗ്രാം', 'Echocardiogram'],
  ['endoscopy', 'എൻഡോസ്കോപ്പി', 'Endoscopy'],
  ['dialysis', 'ഡയാലിസിസ്', 'Dialysis']
];

async function seedContentSet(pool, rows, type) {
  for (const [slug, ml, en] of rows) {
    await pool.query(
      `INSERT INTO content_items
         (slug, type, title_ml, title_en, body_ml, body_en, excerpt_ml, excerpt_en,
          status, published_at, meta_title_ml, meta_title_en, meta_desc_ml, meta_desc_en)
       SELECT $1,$2,$3,$4,$5,$6,$7,$8,'published',now(),$3,$4,$7,$8
        WHERE NOT EXISTS (SELECT 1 FROM content_items WHERE slug = $1)`,
      [slug, type, ml, en,
       `${ml} — വിദ്യാഭ്യാസ വിവരങ്ങൾ മാത്രം.`, `${en} — educational information only.`,
       `${en} overview`, `${en} overview`]
    );
  }
}

async function seedDiseaseDetails(pool) {
  // Generic educational placeholders (bilingual). Same structure for all demo
  // diseases; real content is authored via the CMS.
  const sym_ml = ['പനി', 'ക്ഷീണം'], sym_en = ['Fever', 'Fatigue'];
  const cau_ml = ['അണുബാധ'], cau_en = ['Infection'];
  const risk_ml = ['പ്രായം', 'ജീവിതശൈലി'], risk_en = ['Age', 'Lifestyle'];
  const emer_ml = ['ശ്വാസതടസ്സം', 'കടുത്ത വേദന'], emer_en = ['Difficulty breathing', 'Severe pain'];
  for (const [slug] of DISEASES) {
    await pool.query(
      `INSERT INTO disease_details
         (content_item_id, symptoms_ml, symptoms_en, causes_ml, causes_en,
          risk_factors_ml, risk_factors_en, diagnosis_ml, diagnosis_en,
          treatment_ml, treatment_en, prevention_ml, prevention_en,
          emergency_signs_ml, emergency_signs_en)
       SELECT c.id, $2,$3,$4,$5,$6,$7,
              'ഡോക്ടറുടെ പരിശോധന', 'Clinical examination',
              'യോഗ്യതയുള്ള ഡോക്ടറെ സമീപിക്കുക', 'Consult a qualified doctor',
              'ആരോഗ്യകരമായ ജീവിതശൈലി', 'Healthy lifestyle', $8,$9
         FROM content_items c WHERE c.slug = $1 AND c.type = 'disease'
          AND NOT EXISTS (SELECT 1 FROM disease_details d WHERE d.content_item_id = c.id)`,
      [slug, sym_ml, sym_en, cau_ml, cau_en, risk_ml, risk_en, emer_ml, emer_en]
    );
  }
}

async function seedContent(pool) {
  await seedContentSet(pool, DISEASES, 'disease');
  await seedContentSet(pool, ARTICLES, 'article');
  await seedContentSet(pool, PROCEDURES, 'procedure');
  // initial version rows
  await pool.query(
    `INSERT INTO content_versions (content_item_id, version_number, body_ml, body_en)
     SELECT id, 1, body_ml, body_en FROM content_items c
      WHERE NOT EXISTS (SELECT 1 FROM content_versions v WHERE v.content_item_id = c.id)`
  );
  await seedDiseaseDetails(pool);
}

// [slug, name_ml, name_en, icon, specialty_slug, urgency]
const SYMPTOMS = [
  ['fever', 'പനി', 'Fever', 'thermometer', 'general-physician', 'soon'],
  ['chest-pain', 'നെഞ്ചുവേദന', 'Chest Pain', 'heart', 'cardiology', 'emergency'],
  ['skin-rash', 'ത്വക്ക് തിണർപ്പ്', 'Skin Rash', 'sparkles', 'dermatology', 'routine'],
  ['child-fever', 'കുട്ടികളിലെ പനി', 'Child Fever', 'baby', 'pediatrics', 'soon'],
  ['headache', 'തലവേദന', 'Headache', 'brain', 'neurology', 'routine'],
  ['joint-pain', 'സന്ധിവേദന', 'Joint Pain', 'bone', 'orthopedics', 'routine'],
  ['eye-redness', 'കണ്ണ് ചുവപ്പ്', 'Eye Redness', 'eye', 'ophthalmology', 'soon'],
  ['toothache', 'പല്ലുവേദന', 'Toothache', 'tooth', 'dentistry', 'routine'],
  ['breathing-difficulty', 'ശ്വാസതടസ്സം', 'Breathing Difficulty', 'lungs', 'general-physician', 'emergency'],
  ['anxiety', 'ഉത്കണ്ഠ', 'Anxiety', 'mind', 'psychiatry', 'routine']
];

async function seedSymptoms(pool) {
  for (const [slug, ml, en, icon, spec, urgency] of SYMPTOMS) {
    await pool.query(
      `INSERT INTO symptoms (slug, name_ml, name_en, icon_name)
       SELECT $1,$2,$3,$4 WHERE NOT EXISTS (SELECT 1 FROM symptoms WHERE slug = $1)`,
      [slug, ml, en, icon]
    );
    await pool.query(
      `INSERT INTO symptom_specialties (symptom_id, specialty_id, urgency_level)
       SELECT s.id, sp.id, $3 FROM symptoms s, specialties sp
        WHERE s.slug = $1 AND sp.slug = $2
       ON CONFLICT (symptom_id, specialty_id) DO NOTHING`,
      [slug, spec, urgency]
    );
  }
}

async function seedAuthUsers(pool) {
  // Patient (Demo Patient) login mobile.
  await pool.query(
    `UPDATE users SET mobile_hash = $1, updated_at = now()
      WHERE full_name = 'Demo Patient' AND mobile_hash IS NULL`,
    [mobileHash(DEMO_LOGINS.patient)]
  );
  // Doctor login → linked to dr-anand.
  await pool.query(
    `INSERT INTO users (role, full_name, mobile_hash)
     SELECT 'doctor','Dr. Anand Nair', $1
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE mobile_hash = $1)`,
    [mobileHash(DEMO_LOGINS.doctor)]
  );
  await pool.query(
    `UPDATE doctors SET user_id = (SELECT id FROM users WHERE mobile_hash = $1)
      WHERE slug = 'dr-anand-nair-cardiology-ernakulam' AND user_id IS NULL`,
    [mobileHash(DEMO_LOGINS.doctor)]
  );
  // Platform admin login.
  await pool.query(
    `INSERT INTO users (role, full_name, mobile_hash)
     SELECT 'platform_admin','Demo Admin', $1
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE mobile_hash = $1)`,
    [mobileHash(DEMO_LOGINS.admin)]
  );
  // Content editor login (editorial workflow — cannot publish).
  await pool.query(
    `INSERT INTO users (role, full_name, mobile_hash)
     SELECT 'content_editor','Demo Editor', $1
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE mobile_hash = $1)`,
    [mobileHash(DEMO_LOGINS.editor)]
  );
  // Jobs: employer login (hospital_admin) + candidate login (patient).
  await pool.query(
    `INSERT INTO users (role, full_name, mobile_hash)
     SELECT 'hospital_admin','Demo Employer', $1
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE mobile_hash = $1)`,
    [mobileHash(DEMO_LOGINS.employer)]
  );
  await pool.query(
    `INSERT INTO users (role, full_name, mobile_hash)
     SELECT 'patient','Demo Candidate', $1
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE mobile_hash = $1)`,
    [mobileHash(DEMO_LOGINS.candidate)]
  );
}

const REVIEWERS = ['Arjun Raj', 'Divya Suresh', 'Nikhil Pillai', 'Anjali Menon', 'Rebin Thomas'];
// [entity_type, entity_slug, reviewer_index, rating, title, body]
const DEMO_REVIEWS = [
  ['doctor', 'dr-anand-nair-cardiology-ernakulam', 0, 5, 'Excellent cardiologist', 'Very thorough and caring. Explained my condition clearly and patiently.'],
  ['doctor', 'dr-anand-nair-cardiology-ernakulam', 1, 4, 'Good experience', 'Professional and attentive. Slight wait time but worth it.'],
  ['doctor', 'dr-meera-pillai-pediatrics-thiruvananthapuram', 2, 5, 'Great with kids', 'My daughter felt comfortable throughout. Highly recommend.'],
  ['doctor', 'dr-rahul-menon-dermatology-kozhikode', 3, 4, 'Helpful dermatologist', 'Clear advice on skin care routine. Will visit again.'],
  ['doctor', 'dr-rahul-menon-dermatology-kozhikode', 4, 5, 'Very knowledgeable', 'Solved my long-standing skin issue quickly and kindly.'],
  ['hospital', 'lakeshore-hospital-ernakulam', 0, 5, 'Top facilities', 'Clean, well-staffed, modern equipment. Smooth experience.'],
  ['hospital', 'lakeshore-hospital-ernakulam', 2, 4, 'Good care', 'Attentive nurses and clear billing.'],
  ['hospital', 'medical-trust-hospital-thiruvananthapuram', 1, 5, 'Excellent service', 'Quick admission and great doctors.']
];

async function seedReviews(pool) {
  for (const name of REVIEWERS) {
    await pool.query(
      `INSERT INTO users (role, full_name, locale)
       SELECT 'patient', $1, 'ml' WHERE NOT EXISTS (SELECT 1 FROM users WHERE full_name = $1)`,
      [name]
    );
  }
  for (const [etype, slug, ri, rating, title, body] of DEMO_REVIEWS) {
    const table = etype === 'doctor' ? 'doctors' : 'hospitals';
    await pool.query(
      `INSERT INTO reviews (entity_type, entity_id, patient_id, rating, title, body, status)
       SELECT $1, e.id, u.id, $4, $5, $6, 'approved'
         FROM ${table} e, users u
        WHERE e.slug = $2 AND u.full_name = $3
       ON CONFLICT (entity_type, entity_id, patient_id) DO NOTHING`,
      [etype, slug, REVIEWERS[ri], rating, title, body]
    );
  }
}

async function seedPatientAndAvailability(pool) {
  // One demo patient (idempotent by name).
  await pool.query(
    `INSERT INTO users (role, full_name, locale)
     SELECT 'patient','Demo Patient','ml'
      WHERE NOT EXISTS (SELECT 1 FROM users WHERE full_name = 'Demo Patient')`
  );
  // Mon-Fri availability for every demo doctor: 09:00-12:00 in-person, 14:00-16:00 video.
  const windows = [['09:00', '12:00', 'in_person'], ['14:00', '16:00', 'video']];
  for (const d of DEMO_DOCTORS) {
    for (let dow = 1; dow <= 5; dow++) {
      for (const [start, end, mode] of windows) {
        await pool.query(
          `INSERT INTO availability_templates
             (provider_id, day_of_week, start_time, end_time, slot_duration_minutes, consultation_mode)
           SELECT id, $2, $3, $4, 30, $5 FROM doctors WHERE slug = $1
             AND NOT EXISTS (
               SELECT 1 FROM availability_templates a
                WHERE a.provider_id = doctors.id AND a.day_of_week = $2 AND a.start_time = $3
             )`,
          [d[3], dow, start, end, mode]
        );
      }
    }
  }
}

async function populateVectors(pool) {
  const docs = await pool.query(
    `SELECT d.id, d.display_name, d.about_ml, d.about_en,
            di.name_ml AS district_ml, di.name_en AS district_en,
            s.name_ml AS specialty_ml, s.name_en AS specialty_en
       FROM doctors d
       LEFT JOIN districts di ON di.id = d.district_id
       LEFT JOIN specialties s ON s.id = d.specialty_id
      WHERE d.slug = ANY($1)`,
    [DEMO_DOCTORS.map((d) => d[3])]
  );
  for (const row of docs.rows) {
    const u = doctorVectorUpdate(row);
    await pool.query(u.text, u.values);
  }
  const hosps = await pool.query(
    `SELECT h.id, h.name_ml, h.name_en, h.about_ml, h.about_en,
            di.name_ml AS district_ml, di.name_en AS district_en
       FROM hospitals h LEFT JOIN districts di ON di.id = h.district_id
      WHERE h.slug = ANY($1)`,
    [DEMO_HOSPITALS.map((h) => h[2])]
  );
  for (const row of hosps.rows) {
    const u = hospitalVectorUpdate(row);
    await pool.query(u.text, u.values);
  }
  return { doctors: docs.rowCount, hospitals: hosps.rowCount };
}

// name_ml, name_en, slug, type, district_code, nabl, cert, home, home_fee, phone, report_hours, online
const DEMO_LABS = [
  ['തൈറോകെയർ ലാബ്', 'Thyrocare Lab', 'thyrocare-lab-ernakulam', 'pathology', 'EKM', true, 'NABL-MC-2451', true, 100, ['0484-2200100', '9847000100'], 12, true],
  ['മെട്രോപോളിസ്', 'Metropolis Diagnostics', 'metropolis-diagnostics-thiruvananthapuram', 'multi-specialty', 'TVM', true, 'NABL-MC-2452', true, 150, ['0471-2300200'], 24, true],
  ['SRL ഡയഗ്നോസ്റ്റിക്സ്', 'SRL Diagnostics', 'srl-diagnostics-kozhikode', 'pathology', 'KKD', true, 'NABL-MC-2453', false, null, ['0495-2400300'], 24, false],
  ['അമല സ്കാൻ', 'Amala Scan Centre', 'amala-scan-centre-thrissur', 'radiology', 'TSR', false, null, false, null, ['0487-2500400'], 6, true],
  ['ലൈഫ്‌ലൈൻ ലാബ്', 'Lifeline Lab', 'lifeline-lab-kottayam', 'imaging', 'KTM', true, 'NABL-MC-2455', true, 120, ['0481-2600500', '9847000500'], 18, false]
];
const LAB_HOURS = { mon: { open: '07:00', close: '20:00' }, tue: { open: '07:00', close: '20:00' }, wed: { open: '07:00', close: '20:00' }, thu: { open: '07:00', close: '20:00' }, fri: { open: '07:00', close: '20:00' }, sat: { open: '07:00', close: '18:00' }, sun: { open: '08:00', close: '13:00' } };
// name_ml, name_en, code, category, price, sample, fasting, report_hours, home
const LAB_TESTS = [
  ['സമ്പൂർണ രക്തപരിശോധന', 'Complete Blood Count (CBC)', 'CBC', 'hematology', 300, 'blood', false, 12, true],
  ['രക്തത്തിലെ പഞ്ചസാര (ഫാസ്റ്റിംഗ്)', 'Fasting Blood Sugar', 'FBS', 'biochemistry', 120, 'blood', true, 6, true],
  ['ലിപിഡ് പ്രൊഫൈൽ', 'Lipid Profile', 'LIPID', 'biochemistry', 600, 'blood', true, 24, true],
  ['തൈറോയ്ഡ് പ്രൊഫൈൽ', 'Thyroid Profile (T3 T4 TSH)', 'TFT', 'biochemistry', 550, 'blood', false, 24, true],
  ['കരൾ പ്രവർത്തന പരിശോധന', 'Liver Function Test', 'LFT', 'biochemistry', 700, 'blood', true, 24, true],
  ['വൃക്ക പ്രവർത്തന പരിശോധന', 'Kidney Function Test', 'KFT', 'biochemistry', 700, 'blood', true, 24, true],
  ['മൂത്രപരിശോധന', 'Urine Routine', 'URINE', 'microbiology', 150, 'urine', false, 12, false],
  ['HbA1c', 'HbA1c (Glycated Haemoglobin)', 'HBA1C', 'biochemistry', 450, 'blood', false, 24, true],
  ['വിറ്റാമിൻ D', 'Vitamin D (25-OH)', 'VITD', 'biochemistry', 1200, 'blood', false, 48, true],
  ['നെഞ്ച് എക്സ്-റേ', 'Chest X-Ray', 'CXR', 'radiology', 400, 'imaging', false, 2, false]
];

async function seedLabs(pool) {
  for (let i = 0; i < DEMO_LABS.length; i++) {
    const l = DEMO_LABS[i];
    await pool.query(
      `INSERT INTO diagnostic_labs
         (name_ml,name_en,slug,type,verification_status,district_id,
          is_nabl_accredited,nabl_cert_number,home_collection,home_collection_fee_inr,
          phone,operating_hours,report_delivery_hours,online_reports,rating_avg,rating_count)
       SELECT $1,$2,$3,$4,'verified',di.id,$5,$6,$7,$8,$9,$10::jsonb,$11,$12,$13,$14
         FROM districts di WHERE di.code=$15
       ON CONFLICT (slug) DO NOTHING`,
      [l[0], l[1], l[2], l[3], l[5], l[6], l[7], l[8], l[9], JSON.stringify(LAB_HOURS), l[10], l[11],
       (4.0 + i * 0.15).toFixed(2), 20 + i * 7, l[4]]
    );
    for (const trow of LAB_TESTS) {
      await pool.query(
        `INSERT INTO lab_tests
           (lab_id,test_name_ml,test_name_en,test_code,category,price_inr,sample_type,fasting_required,report_hours,home_collection_available)
         SELECT id,$2,$3,$4,$5,$6,$7,$8,$9,$10 FROM diagnostic_labs WHERE slug=$1
           AND NOT EXISTS (SELECT 1 FROM lab_tests t WHERE t.lab_id = diagnostic_labs.id AND t.test_code = $4)`,
        [l[2], trow[0], trow[1], trow[2], trow[3], trow[4] + i * 20, trow[5], trow[6], trow[7], l[7] && trow[8]]
      );
    }
  }
}

// name_ml, name_en, slug, type, district_code, is_24hr, delivery, radius, generic, cold, phone
const DEMO_PHARMACIES = [
  ['അപ്പോളോ ഫാർമസി', 'Apollo Pharmacy', 'apollo-pharmacy-ernakulam', 'retail', 'EKM', true, true, 5, false, true, ['0484-2711000', '9847100100']],
  ['ജനൗഷധി കേന്ദ്രം', 'Jan Aushadhi Kendra', 'jan-aushadhi-kendra-thiruvananthapuram', 'generic', 'TVM', false, false, null, true, false, ['0471-2711200']],
  ['മെഡ്‌പ്ലസ്', 'MedPlus Pharmacy', 'medplus-pharmacy-kozhikode', 'retail', 'KKD', true, true, 8, true, true, ['0495-2711300']],
  ['അമല ഫാർമസി', 'Amala Hospital Pharmacy', 'amala-hospital-pharmacy-thrissur', 'hospital', 'TSR', true, false, null, false, true, ['0487-2711400']],
  ['നെറ്റ്‌മെഡ്‌സ്', 'Netmeds Store', 'netmeds-store-kottayam', 'online', 'KTM', false, true, 15, true, false, ['0481-2711500', '9847100500']]
];
const PHARM_HOURS = { mon: { open: '08:00', close: '22:00' }, tue: { open: '08:00', close: '22:00' }, wed: { open: '08:00', close: '22:00' }, thu: { open: '08:00', close: '22:00' }, fri: { open: '08:00', close: '22:00' }, sat: { open: '08:00', close: '22:00' }, sun: { open: '09:00', close: '21:00' } };

async function seedPharmacies(pool) {
  for (let i = 0; i < DEMO_PHARMACIES.length; i++) {
    const p = DEMO_PHARMACIES[i];
    await pool.query(
      `INSERT INTO pharmacies
         (name_ml,name_en,slug,type,verification_status,district_id,is_24hr,has_delivery,
          delivery_radius_km,sells_generic,has_cold_storage,phone,operating_hours,rating_avg,rating_count)
       SELECT $1,$2,$3,$4,'verified',di.id,$5,$6,$7,$8,$9,$10,$11::jsonb,$12,$13
         FROM districts di WHERE di.code=$14
       ON CONFLICT (slug) DO NOTHING`,
      [p[0], p[1], p[2], p[3], p[5], p[6], p[7], p[8], p[9], p[10],
       JSON.stringify(p[5] ? {} : PHARM_HOURS), (4.1 + i * 0.12).toFixed(2), 30 + i * 9, p[4]]
    );
  }
}

// name_ml, name_en, slug, district_code, hospital_slug|null, phone[], emergency, license, is_24hr, types[], apheresis, component
const DEMO_BLOOD_BANKS = [
  ['ലേക്ഷോർ ബ്ലഡ് ബാങ്ക്', 'Lakeshore Blood Bank', 'lakeshore-blood-bank-ernakulam', 'EKM', 'lakeshore-hospital-ernakulam', ['0484-2701000'], '0484-2701108', 'KL-BB-EKM-001', true, ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'], true, true],
  ['മെഡിക്കൽ ട്രസ്റ്റ് ബ്ലഡ് ബാങ്ക്', 'Medical Trust Blood Bank', 'medical-trust-blood-bank-thiruvananthapuram', 'TVM', 'medical-trust-hospital-thiruvananthapuram', ['0471-2702000'], '0471-2702108', 'KL-BB-TVM-002', true, ['A+', 'B+', 'O+', 'O-', 'AB+'], false, true],
  ['ഗവ. ബ്ലഡ് ബാങ്ക് കോഴിക്കോട്', 'Govt Blood Bank Kozhikode', 'govt-blood-bank-kozhikode', 'KKD', 'general-hospital-kozhikode', ['0495-2703000'], '0495-2703108', 'KL-BB-KKD-003', true, ['A+', 'A-', 'B+', 'O+', 'O-'], false, false],
  ['അമല ബ്ലഡ് ബാങ്ക്', 'Amala Blood Bank', 'amala-blood-bank-thrissur', 'TSR', 'amala-hospital-thrissur', ['0487-2704000'], '0487-2704108', 'KL-BB-TSR-004', false, ['A+', 'B+', 'B-', 'O+', 'AB+', 'AB-'], true, true],
  ['കാരിത്താസ് ബ്ലഡ് ബാങ്ക്', 'Caritas Blood Bank', 'caritas-blood-bank-kottayam', 'KTM', 'caritas-hospital-kottayam', ['0481-2705000'], '0481-2705108', 'KL-BB-KTM-005', true, ['A+', 'O+', 'O-', 'AB+', 'AB-'], false, true]
];
const BB_HOURS = { mon: { open: '09:00', close: '17:00' }, tue: { open: '09:00', close: '17:00' }, wed: { open: '09:00', close: '17:00' }, thu: { open: '09:00', close: '17:00' }, fri: { open: '09:00', close: '17:00' }, sat: { open: '09:00', close: '13:00' }, sun: { open: '', close: '' } };

async function seedBloodBanks(pool) {
  for (const b of DEMO_BLOOD_BANKS) {
    await pool.query(
      `INSERT INTO blood_banks
         (name_ml,name_en,slug,district_id,hospital_id,phone,emergency_phone,license_number,
          is_24hr,blood_types_available,has_apheresis,has_component_separation,operating_hours,verification_status)
       SELECT $1,$2,$3,di.id,(SELECT id FROM hospitals WHERE slug=$4),$5,$6,$7,$8,$9,$10,$11,$12::jsonb,'verified'
         FROM districts di WHERE di.code=$13
       ON CONFLICT (slug) DO NOTHING`,
      [b[0], b[1], b[2], b[4], b[5], b[6], b[7], b[8], b[9], b[10], b[11],
       JSON.stringify(b[8] ? {} : BB_HOURS), b[3]]
    );
  }
}

// name_ml, name_en, slug, type, district_code, phone[], whatsapp, coverage[], is_24hr, amb_types[], oxygen, vent, cardiac, paramedic, base, per_km
const DEMO_AMBULANCE = [
  ['കനിവ് 108', 'Kanivu 108 Ambulance', 'kanivu-108-ambulance-ernakulam', 'government', 'EKM', ['108'], null, ['Ernakulam', 'Thrissur', 'Kottayam'], true, ['basic', 'advanced'], true, false, false, true, 0, 0],
  ['ആസ്റ്റർ ആംബുലൻസ്', 'Aster Ambulance Service', 'aster-ambulance-ernakulam', 'hospital-based', 'EKM', ['0484-6699999', '9847011111'], '919847011111', ['Ernakulam'], true, ['icu', 'advanced', 'basic'], true, true, true, true, 1500, 40],
  ['കിംസ് ആംബുലൻസ്', 'KIMS Ambulance', 'kims-ambulance-thiruvananthapuram', 'hospital-based', 'TVM', ['0471-3041000'], '919847022222', ['Thiruvananthapuram', 'Kollam'], true, ['icu', 'nicu', 'advanced'], true, true, true, true, 1800, 45],
  ['സ്നേഹ ആംബുലൻസ്', 'Sneha Ambulance NGO', 'sneha-ambulance-kozhikode', 'ngo', 'KKD', ['9847033333'], '919847033333', ['Kozhikode', 'Malappuram', 'Wayanad'], true, ['basic'], true, false, false, false, 500, 20],
  ['ലൈഫ്‌ലൈൻ ആംബുലൻസ്', 'Lifeline Ambulance', 'lifeline-ambulance-thrissur', 'private', 'TSR', ['9847044444', '0487-2333444'], '919847044444', ['Thrissur', 'Palakkad'], true, ['advanced', 'icu', 'mortuary'], true, true, true, true, 1200, 35]
];

async function seedAmbulance(pool) {
  for (const a of DEMO_AMBULANCE) {
    await pool.query(
      `INSERT INTO ambulance_providers
         (name_ml,name_en,slug,type,district_id,phone,whatsapp_number,coverage_districts,is_24hr,
          ambulance_types,has_oxygen,has_ventilator,has_cardiac_monitor,has_trained_paramedic,
          base_fare_inr,per_km_fare_inr,verification_status)
       SELECT $1,$2,$3,$4,di.id,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,'verified'
         FROM districts di WHERE di.code=$16
       ON CONFLICT (slug) DO NOTHING`,
      [a[0], a[1], a[2], a[3], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[14], a[15], a[16], a[4]]
    );
  }
}

// name_ml, name_en, slug, district_code, reg, treatments[], xray, rct, implants, ortho, pediatric, steril, fee
const DEMO_DENTAL = [
  ['സ്മൈൽ കെയർ ഡെന്റൽ', 'Smile Care Dental Clinic', 'smile-care-dental-ernakulam', 'EKM', 'KDC-EKM-001', ['cleaning', 'filling', 'root_canal', 'implant', 'whitening', 'extraction'], true, true, true, false, false, 'Class B autoclave', 300],
  ['ഡെന്റൽ വേൾഡ്', 'Dental World', 'dental-world-thiruvananthapuram', 'TVM', 'KDC-TVM-002', ['cleaning', 'filling', 'root_canal', 'braces', 'orthodontics', 'extraction'], true, true, false, true, false, 'Class B autoclave', 250],
  ['പേൾ ഡെന്റൽ കെയർ', 'Pearl Dental Care', 'pearl-dental-care-kozhikode', 'KKD', 'KDC-KKD-003', ['cleaning', 'filling', 'whitening', 'pediatric', 'extraction'], true, false, false, false, true, 'Class N autoclave', 200],
  ['ഓർത്തോ ഡെന്റൽ സ്റ്റുഡിയോ', 'Ortho Dental Studio', 'ortho-dental-studio-thrissur', 'TSR', 'KDC-TSR-004', ['cleaning', 'braces', 'orthodontics', 'implant', 'root_canal'], true, true, true, true, false, 'Class B autoclave', 400],
  ['കിഡ്‌സ് & ഫാമിലി ഡെന്റൽ', 'Kids & Family Dental', 'kids-family-dental-kottayam', 'KTM', 'KDC-KTM-005', ['cleaning', 'filling', 'pediatric', 'extraction', 'whitening'], true, false, false, false, true, 'Class N autoclave', 220]
];

async function seedDental(pool) {
  for (let i = 0; i < DEMO_DENTAL.length; i++) {
    const c = DEMO_DENTAL[i];
    await pool.query(
      `INSERT INTO dental_clinics
         (name_ml,name_en,slug,district_id,registration_number,treatments_offered,
          has_digital_xray,has_rct,has_implants,has_orthodontics,has_pediatric_dental,
          sterilisation_standard,consultation_fee_inr,verification_status,rating_avg,rating_count)
       SELECT $1,$2,$3,di.id,$4,$5,$6,$7,$8,$9,$10,$11,$12,'verified',$13,$14
         FROM districts di WHERE di.code=$15
       ON CONFLICT (slug) DO NOTHING`,
      [c[0], c[1], c[2], c[4], c[5], c[6], c[7], c[8], c[9], c[10], c[11], c[12],
       (4.2 + i * 0.1).toFixed(2), 25 + i * 8, c[3]]
    );
  }
}

// name_ml, name_en, slug, type, district_code, surgeries[], equipment[], optical, lowvision, pediatric, fee
const DEMO_EYE = [
  ['ദൃഷ്ടി നേത്ര ആശുപത്രി', 'Drishti Eye Hospital', 'drishti-eye-hospital-ernakulam', 'hospital', 'EKM', ['cataract', 'lasik', 'glaucoma', 'retina', 'cornea'], ['oct', 'slit_lamp', 'field_analyser', 'fundus_camera'], true, true, true, 350],
  ['വിഷൻ കെയർ ഐ സെന്റർ', 'Vision Care Eye Centre', 'vision-care-eye-centre-thiruvananthapuram', 'clinic', 'TVM', ['cataract', 'glaucoma', 'squint'], ['slit_lamp', 'fundus_camera'], true, false, true, 250],
  ['നേത്ര ഒപ്റ്റിക്കൽസ്', 'Nethra Opticals & Eye Clinic', 'nethra-opticals-kozhikode', 'optical_shop', 'KKD', ['cataract'], ['slit_lamp'], true, false, false, 150]
];

async function seedEyeCentres(pool) {
  for (let i = 0; i < DEMO_EYE.length; i++) {
    const e = DEMO_EYE[i];
    await pool.query(
      `INSERT INTO eye_centres
         (name_ml,name_en,slug,type,district_id,surgeries_offered,equipment,
          has_optical_shop,has_low_vision_clinic,has_pediatric_ophthalmology,
          consultation_fee_inr,verification_status,rating_avg,rating_count)
       SELECT $1,$2,$3,$4,di.id,$5,$6,$7,$8,$9,$10,'verified',$11,$12
         FROM districts di WHERE di.code=$13
       ON CONFLICT (slug) DO NOTHING`,
      [e[0], e[1], e[2], e[3], e[5], e[6], e[7], e[8], e[9], e[10],
       (4.3 + i * 0.1).toFixed(2), 30 + i * 10, e[4]]
    );
  }
}

// name_ml, name_en, slug, district_code, specialisations[], equipment[], home, home_districts[], consult_fee, session_fee
const DEMO_PHYSIO = [
  ['ആക്ടീവ് ഫിസിയോ ക്ലിനിക്', 'Active Physio Clinic', 'active-physio-clinic-ernakulam', 'EKM', ['ortho', 'sports', 'neuro'], ['ultrasound', 'tens', 'traction', 'laser'], true, ['Ernakulam', 'Thrissur'], 300, 500],
  ['റീഹാബ് കെയർ സെന്റർ', 'Rehab Care Centre', 'rehab-care-centre-thiruvananthapuram', 'TVM', ['neuro', 'geriatric', 'cardio'], ['ultrasound', 'tens', 'hydrotherapy'], true, ['Thiruvananthapuram'], 250, 400],
  ['മൊബിലിറ്റി ഫിസിയോ', 'Mobility Physiotherapy', 'mobility-physiotherapy-kozhikode', 'KKD', ['ortho', 'paediatric', 'geriatric'], ['tens', 'traction'], false, [], 200, 350]
];

async function seedPhysio(pool) {
  for (let i = 0; i < DEMO_PHYSIO.length; i++) {
    const p = DEMO_PHYSIO[i];
    await pool.query(
      `INSERT INTO physio_centres
         (name_ml,name_en,slug,district_id,specialisations,equipment,has_home_visit,
          home_visit_districts,consultation_fee_inr,session_fee_inr,verification_status,rating_avg,rating_count)
       SELECT $1,$2,$3,di.id,$4,$5,$6,$7,$8,$9,'verified',$10,$11
         FROM districts di WHERE di.code=$12
       ON CONFLICT (slug) DO NOTHING`,
      [p[0], p[1], p[2], p[4], p[5], p[6], p[7], p[8], p[9],
       (4.2 + i * 0.1).toFixed(2), 20 + i * 9, p[3]]
    );
  }
}

// name_ml, name_en, slug, type, district_code, services[], inpatient, beds, emergency, govt, emergency_phone, fee
const DEMO_MENTAL = [
  ['ശാന്തി മെന്റൽ ഹെൽത്ത് സെന്റർ', 'Shanti Mental Health Centre', 'shanti-mental-health-ernakulam', 'hospital', 'EKM', ['psychiatry', 'psychology', 'counselling', 'group_therapy'], true, 30, true, true, '0484-2811108', 400],
  ['പുനർജനി ഡീ-അഡിക്ഷൻ സെന്റർ', 'Punarjani De-addiction Centre', 'punarjani-deaddiction-thrissur', 'deaddiction', 'TSR', ['deaddiction', 'rehabilitation', 'counselling', 'group_therapy'], true, 40, true, true, '0487-2811108', 300],
  ['മൈൻഡ്‌ഫുൾ കൗൺസലിംഗ്', 'Mindful Counselling Clinic', 'mindful-counselling-thiruvananthapuram', 'counselling', 'TVM', ['psychology', 'counselling'], false, null, false, false, null, 250]
];

async function seedMentalHealth(pool) {
  for (let i = 0; i < DEMO_MENTAL.length; i++) {
    const m = DEMO_MENTAL[i];
    await pool.query(
      `INSERT INTO mental_health_centres
         (name_ml,name_en,slug,type,district_id,services,has_inpatient,inpatient_beds,
          has_emergency,is_govt_approved,emergency_phone,consultation_fee_inr,verification_status,rating_avg,rating_count)
       SELECT $1,$2,$3,$4,di.id,$5,$6,$7,$8,$9,$10,$11,'verified',$12,$13
         FROM districts di WHERE di.code=$14
       ON CONFLICT (slug) DO NOTHING`,
      [m[0], m[1], m[2], m[3], m[5], m[6], m[7], m[8], m[9], m[10], m[11],
       (4.3 + i * 0.1).toFixed(2), 15 + i * 6, m[4]]
    );
  }
}

// name_ml, name_en, slug, district_code, hospital_slug|null, machines, sessions_wk, shifts[], hd, pd, hdf, govt, fee
const DEMO_DIALYSIS = [
  ['ലേക്ഷോർ ഡയാലിസിസ്', 'Lakeshore Dialysis Centre', 'lakeshore-dialysis-ernakulam', 'EKM', 'lakeshore-hospital-ernakulam', 20, 336, [{ shift: 'morning', time: '07:00-11:00' }, { shift: 'afternoon', time: '12:00-16:00' }, { shift: 'evening', time: '17:00-21:00' }], true, true, true, true, 1500],
  ['ജനറൽ ആശുപത്രി ഡയാലിസിസ്', 'General Hospital Dialysis Unit', 'general-hospital-dialysis-kozhikode', 'KKD', 'general-hospital-kozhikode', 15, 252, [{ shift: 'morning', time: '06:00-10:00' }, { shift: 'afternoon', time: '11:00-15:00' }], true, false, false, true, 0],
  ['കെയർ കിഡ്‌നി സെന്റർ', 'Care Kidney Centre', 'care-kidney-centre-thiruvananthapuram', 'TVM', null, 10, 168, [{ shift: 'morning', time: '07:00-11:00' }, { shift: 'evening', time: '16:00-20:00' }], true, true, false, false, 1200]
];

async function seedDialysis(pool) {
  for (const d of DEMO_DIALYSIS) {
    await pool.query(
      `INSERT INTO dialysis_centres
         (name_ml,name_en,slug,district_id,hospital_id,machine_count,sessions_per_week,
          shift_timings,has_hd,has_pd,has_hdf,accepts_govt_scheme,fee_per_session_inr,verification_status)
       SELECT $1,$2,$3,di.id,(SELECT id FROM hospitals WHERE slug=$4),$5,$6,$7::jsonb,$8,$9,$10,$11,$12,'verified'
         FROM districts di WHERE di.code=$13
       ON CONFLICT (slug) DO NOTHING`,
      [d[0], d[1], d[2], d[4], d[5], d[6], JSON.stringify(d[7]), d[8], d[9], d[10], d[11], d[12], d[3]]
    );
  }
}

// name_ml, name_en, slug, district_code, treatments[], sperm_bank, egg_donation, success_rate, est_year, fee
const DEMO_FERTILITY = [
  ['ക്രാഡിൽ ഫെർട്ടിലിറ്റി', 'Cradle Fertility Centre', 'cradle-fertility-ernakulam', 'EKM', ['ivf', 'iui', 'icsi', 'egg_freezing', 'embryo_freezing', 'donor_egg', 'male_infertility'], true, true, 62, 2012, 800],
  ['ന്യൂ ലൈഫ് IVF', 'New Life IVF Centre', 'new-life-ivf-thiruvananthapuram', 'TVM', ['ivf', 'iui', 'icsi', 'surrogacy_consultation', 'sperm_bank'], true, false, 58, 2015, 600],
  ['ബ്ലെസിംഗ് ഫെർട്ടിലിറ്റി', 'Blessing Fertility Clinic', 'blessing-fertility-kozhikode', 'KKD', ['ivf', 'iui', 'male_infertility'], false, false, 55, 2018, 500]
];

async function seedFertility(pool) {
  for (let i = 0; i < DEMO_FERTILITY.length; i++) {
    const f = DEMO_FERTILITY[i];
    await pool.query(
      `INSERT INTO fertility_centres
         (name_ml,name_en,slug,district_id,treatments,has_sperm_bank,has_egg_donation,
          ivf_success_rate_percent,established_year,consultation_fee_inr,verification_status,rating_avg,rating_count)
       SELECT $1,$2,$3,di.id,$4,$5,$6,$7,$8,$9,'verified',$10,$11
         FROM districts di WHERE di.code=$12
       ON CONFLICT (slug) DO NOTHING`,
      [f[0], f[1], f[2], f[4], f[5], f[6], f[7], f[8], f[9],
       (4.2 + i * 0.15).toFixed(2), 20 + i * 8, f[3]]
    );
  }
}

// name_ml, name_en, slug, type, district_code, coverage[], home_visits, inpatient, beds, services[], free, donations
const DEMO_PALLIATIVE = [
  ['പെയിൻ & പാലിയേറ്റീവ് കെയർ സൊസൈറ്റി', 'Pain & Palliative Care Society', 'pain-palliative-society-kozhikode', 'ngo', 'KKD', ['Kozhikode', 'Malappuram', 'Wayanad'], true, true, 20, ['pain_management', 'counselling', 'nursing', 'spiritual_care', 'bereavement'], true, true],
  ['കാരുണ്യ ഹോം കെയർ', 'Karunya Home Care', 'karunya-home-care-ernakulam', 'home_care', 'EKM', ['Ernakulam'], true, false, null, ['pain_management', 'nursing', 'physiotherapy', 'counselling'], true, true],
  ['ശാന്തി ഹോസ്‌പിസ്', 'Shanti Hospice', 'shanti-hospice-thiruvananthapuram', 'hospice', 'TVM', ['Thiruvananthapuram', 'Kollam'], true, true, 15, ['pain_management', 'nursing', 'spiritual_care', 'bereavement'], false, true]
];

async function seedPalliative(pool) {
  for (const p of DEMO_PALLIATIVE) {
    await pool.query(
      `INSERT INTO palliative_centres
         (name_ml,name_en,slug,type,district_id,coverage_districts,has_home_visits,
          has_inpatient,inpatient_beds,services,is_free_of_cost,accepts_donations,verification_status)
       SELECT $1,$2,$3,$4,di.id,$5,$6,$7,$8,$9,$10,$11,'verified'
         FROM districts di WHERE di.code=$12
       ON CONFLICT (slug) DO NOTHING`,
      [p[0], p[1], p[2], p[3], p[5], p[6], p[7], p[8], p[9], p[10], p[11], p[4]]
    );
  }
}

// name_ml, name_en, slug, district_code, coverage[], services[], qual, male, female, min_hrs, hourly, daily, monthly, registered
const DEMO_HOME_NURSING = [
  ['കെയർ അറ്റ് ഹോം', 'Care At Home Nursing', 'care-at-home-nursing-ernakulam', 'EKM', ['Ernakulam', 'Kottayam'], ['general_nursing', 'elderly_care', 'post_surgical', 'wound_care', 'physiotherapy'], 'GNM', true, true, 8, 150, 1000, 25000, true],
  ['ഹെൽപ്പിംഗ് ഹാൻഡ്‌സ്', 'Helping Hands Home Care', 'helping-hands-home-care-thiruvananthapuram', 'TVM', ['Thiruvananthapuram'], ['general_nursing', 'elderly_care', 'baby_care', 'palliative'], 'BSc', false, true, 12, 120, 900, 22000, true],
  ['ഫാമിലി നഴ്സിംഗ് സർവീസ്', 'Family Nursing Service', 'family-nursing-service-kozhikode', 'KKD', ['Kozhikode', 'Malappuram'], ['general_nursing', 'icu_care', 'elderly_care', 'wound_care'], 'ANM', true, true, 24, null, 800, 20000, false]
];

async function seedHomeNursing(pool) {
  for (const a of DEMO_HOME_NURSING) {
    await pool.query(
      `INSERT INTO home_nursing_agencies
         (name_ml,name_en,slug,district_id,coverage_districts,services,nurse_qualification,
          has_male_nurses,has_female_nurses,minimum_booking_hours,hourly_rate_inr,daily_rate_inr,
          monthly_rate_inr,is_registered,verification_status,rating_avg,rating_count)
       SELECT $1,$2,$3,di.id,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'verified',4.30,18
         FROM districts di WHERE di.code=$14
       ON CONFLICT (slug) DO NOTHING`,
      [a[0], a[1], a[2], a[4], a[5], a[6], a[7], a[8], a[9], a[10], a[11], a[12], a[13], a[3]]
    );
  }
}

// doctor_slug, hospital_slug, days[], start, end, ctype, max_tokens, notes_en
const DEMO_OPD = [
  ['dr-sangeeta-varma-cardiology-thrissur', 'amala-hospital-thrissur', [1, 3, 5], '09:00', '13:00', 'outpatient', 40, 'Cardiology OPD'],
  ['dr-priya-suresh-cardiology-thrissur', 'amala-hospital-thrissur', [2, 4], '14:00', '17:00', 'outpatient', 30, 'Afternoon clinic'],
  ['dr-fathima-beevi-dermatology-ernakulam', 'lakeshore-hospital-ernakulam', [1, 2, 3, 4, 5], '10:00', '13:00', 'outpatient', 25, 'Skin & cosmetology OPD']
];

async function seedOpd(pool) {
  for (const o of DEMO_OPD) {
    // Ensure the doctor is affiliated with the hospital.
    await pool.query(
      `INSERT INTO hospital_providers (hospital_id, doctor_id, role)
       SELECT h.id, d.id, 'visiting' FROM hospitals h, doctors d
        WHERE h.slug = $1 AND d.slug = $2
       ON CONFLICT (hospital_id, doctor_id) DO NOTHING`, [o[1], o[0]]);
    await pool.query(
      `INSERT INTO opd_schedules
         (provider_id, hospital_id, day_of_week, start_time, end_time, consultation_type, max_tokens, notes_en)
       SELECT d.id, h.id, $3::int[], $4, $5, $6, $7, $8
         FROM doctors d, hospitals h
        WHERE d.slug = $1 AND h.slug = $2
          AND NOT EXISTS (
            SELECT 1 FROM opd_schedules o
             WHERE o.provider_id = d.id AND o.hospital_id = h.id AND o.start_time = $4::time)`,
      [o[0], o[1], o[2], o[3], o[4], o[5], o[6], o[7]]);
  }
}

async function main() {
  const pool = getPool();
  await runMigrations(pool);
  await seedDoctors(pool);
  await seedHospitals(pool);
  await seedDepartments(pool);
  await seedOpd(pool);
  await seedFacilities(pool);
  await seedLabs(pool);
  await seedPharmacies(pool);
  await seedBloodBanks(pool);
  await seedAmbulance(pool);
  await seedDental(pool);
  await seedEyeCentres(pool);
  await seedPhysio(pool);
  await seedMentalHealth(pool);
  await seedDialysis(pool);
  await seedFertility(pool);
  await seedPalliative(pool);
  await seedHomeNursing(pool);
  await seedPatientAndAvailability(pool);
  await seedAuthUsers(pool);
  await seedContent(pool);
  await seedSymptoms(pool);
  await seedJobs(pool);
  await seedReviews(pool);
  const counts = await populateVectors(pool);
  const rc = (await pool.query(`SELECT count(*)::int AS n FROM reviews WHERE deleted_at IS NULL`)).rows[0].n;
  console.log(`Demo seed complete. Doctors: ${counts.doctors}, Hospitals: ${counts.hospitals}, Departments: ${DEMO_HOSPITALS.length * DEPTS.length}, Facilities: ${DEMO_FACILITIES.length}, Labs: ${DEMO_LABS.length} (${LAB_TESTS.length} tests each), Pharmacies: ${DEMO_PHARMACIES.length}, BloodBanks: ${DEMO_BLOOD_BANKS.length}, Ambulance: ${DEMO_AMBULANCE.length}, Dental: ${DEMO_DENTAL.length}, EyeCentres: ${DEMO_EYE.length}, Physio: ${DEMO_PHYSIO.length}, MentalHealth: ${DEMO_MENTAL.length}, Dialysis: ${DEMO_DIALYSIS.length}, Fertility: ${DEMO_FERTILITY.length}, Palliative: ${DEMO_PALLIATIVE.length}, HomeNursing: ${DEMO_HOME_NURSING.length}, OPD: ${DEMO_OPD.length}, Reviews: ${rc}.`);
}

main()
  .then(closePool)
  .catch(async (err) => {
    console.error(`Demo seed error: ${err.message}`);
    await closePool();
    process.exit(1);
  });
