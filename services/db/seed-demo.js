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

async function main() {
  const pool = getPool();
  await runMigrations(pool);
  await seedDoctors(pool);
  await seedHospitals(pool);
  await seedDepartments(pool);
  await seedFacilities(pool);
  await seedPatientAndAvailability(pool);
  await seedAuthUsers(pool);
  await seedContent(pool);
  await seedSymptoms(pool);
  await seedJobs(pool);
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
