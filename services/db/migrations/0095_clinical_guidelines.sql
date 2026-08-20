-- 0095_clinical_guidelines.sql
-- Clinical Guidelines Simplified. Reuses content_items with type='guideline'.
-- Additive: two nullable columns (source_org, source_url) so the source body can
-- be cited prominently; widen the type CHECK (existing values preserved). Seeds
-- 10 patient-friendly guideline summaries. Each page shows source + disclaimer.

ALTER TABLE content_items ADD COLUMN IF NOT EXISTS source_org text;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS source_url text;

ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_type_check;
ALTER TABLE content_items ADD CONSTRAINT content_items_type_check
  CHECK (type IN ('article','disease','procedure','news','calculator','faq','journey_guide','wellness','guideline'));

INSERT INTO content_items (slug, type, title_ml, title_en, excerpt_ml, excerpt_en, body_en, source_org, source_url, status, published_at, requires_disclaimer)
VALUES
  ('diabetes-management-guideline','guideline','പ്രമേഹ നിയന്ത്രണ മാർഗരേഖ','Diabetes Management (Simplified)',
   'പ്രമേഹ നിയന്ത്രണത്തിനുള്ള ലളിതമായ മാർഗരേഖാ സംഗ്രഹം.','A simplified summary of diabetes-control guidelines.',
   '<ul><li>Target HbA1c is usually below 7% (individualised by your doctor).</li><li>Balanced diet, regular activity and weight control are the foundation.</li><li>Metformin is commonly the first medicine; others are added as needed.</li><li>Check blood sugar, blood pressure, kidneys, eyes and feet regularly.</li><li>Do not stop or change medicines without your doctor.</li></ul>',
   'RSSDI / ICMR', 'https://icmr.gov.in/', 'published', now(), true),
  ('hypertension-control-guideline','guideline','രക്തസമ്മർദ്ദ നിയന്ത്രണ മാർഗരേഖ','Hypertension Control (Simplified)',
   'ഉയർന്ന രക്തസമ്മർദ്ദ നിയന്ത്രണത്തിന്റെ ലളിത സംഗ്രഹം.','A simplified summary of blood-pressure control guidelines.',
   '<ul><li>Most adults aim for a BP below 140/90 mmHg (individualised).</li><li>Reduce salt, maintain a healthy weight and exercise regularly.</li><li>Take BP medicines daily and at the same time.</li><li>Monitor BP at home and keep a record.</li><li>Do not stop medicines when you feel well.</li></ul>',
   'ISH / ICMR', 'https://icmr.gov.in/', 'published', now(), true),
  ('covid-19-management-guideline','guideline','കോവിഡ്-19 ചികിത്സാ മാർഗരേഖ','COVID-19 Management (Simplified)',
   'ICMR അനുസരിച്ചുള്ള കോവിഡ് പരിചരണ സംഗ്രഹം.','A simplified summary of COVID-19 care guidance.',
   '<ul><li>Most mild cases recover at home with rest, fluids and fever medicine.</li><li>Monitor oxygen with a pulse oximeter if advised.</li><li>Seek care urgently if oxygen falls or breathing worsens.</li><li>Vaccination and hand hygiene reduce risk.</li><li>Follow current ICMR advice, which is updated over time.</li></ul>',
   'ICMR', 'https://www.icmr.gov.in/', 'published', now(), true),
  ('tb-treatment-guideline','guideline','ക്ഷയരോഗ ചികിത്സാ മാർഗരേഖ','TB Treatment (Simplified)',
   'ദേശീയ ക്ഷയരോഗ പരിപാടിയുടെ ലളിത സംഗ്രഹം.','A simplified summary of TB treatment under the national programme.',
   '<ul><li>TB is curable with a full course of medicines (usually 6 months).</li><li>Take every dose — stopping early causes drug resistance.</li><li>Free diagnosis and treatment are available at government centres.</li><li>Cover your mouth when coughing and ensure good ventilation.</li><li>Close contacts should be screened.</li></ul>',
   'NTEP (RNTCP)', 'https://tbcindia.gov.in/', 'published', now(), true),
  ('immunisation-schedule-guideline','guideline','പ്രതിരോധ കുത്തിവയ്പ്പ് ഷെഡ്യൂൾ','Immunisation Schedule (Simplified)',
   'കുട്ടികളുടെ പ്രതിരോധ കുത്തിവയ്പ്പ് ഷെഡ്യൂളിന്റെ സംഗ്രഹം.','A simplified summary of the childhood immunisation schedule.',
   '<ul><li>Vaccines protect children from serious diseases — keep to the schedule.</li><li>Birth: BCG, OPV-0, Hepatitis B.</li><li>6/10/14 weeks: pentavalent, OPV, rotavirus, PCV.</li><li>9-12 months: measles-rubella (MR), vitamin A.</li><li>Keep the vaccination card and attend boosters on time.</li></ul>',
   'IAP / NHM', 'https://nhm.gov.in/', 'published', now(), true),
  ('antenatal-care-guideline','guideline','ഗർഭകാല പരിചരണ മാർഗരേഖ','Antenatal Care (Simplified)',
   'ഗർഭകാല പരിചരണത്തിന്റെ ലളിത സംഗ്രഹം.','A simplified summary of antenatal-care guidance.',
   '<ul><li>Register the pregnancy early and attend all check-ups.</li><li>Take iron-folic acid and calcium as advised.</li><li>Get the recommended scans, blood tests and TT/Td vaccines.</li><li>Eat well, rest and watch for danger signs (bleeding, severe headache, reduced baby movements).</li><li>Plan a safe, institutional delivery.</li></ul>',
   'FOGSI', 'https://www.fogsi.org/', 'published', now(), true),
  ('infant-feeding-guideline','guideline','ശിശു ആഹാര മാർഗരേഖ','Infant Feeding (Simplified)',
   'ശിശു ആഹാരത്തിന്റെ ലളിത സംഗ്രഹം.','A simplified summary of infant-feeding guidance.',
   '<ul><li>Breastfeed within the first hour and give only breast milk for 6 months.</li><li>Start complementary foods at 6 months while continuing breastfeeding.</li><li>Give a variety of soft, clean, home foods; increase texture with age.</li><li>Continue breastfeeding up to 2 years.</li><li>Ensure clean hands, water and feeding utensils.</li></ul>',
   'NHM / WHO', 'https://nhm.gov.in/', 'published', now(), true),
  ('mental-health-first-aid-guideline','guideline','മാനസികാരോഗ്യ പ്രഥമ സഹായം','Mental Health First Aid (Simplified)',
   'മാനസികാരോഗ്യ പ്രഥമ സഹായത്തിന്റെ ലളിത സംഗ്രഹം.','A simplified summary of mental-health first aid.',
   '<ul><li>Listen without judgement and take the person seriously.</li><li>Ask directly and calmly if they are thinking of harming themselves.</li><li>Encourage professional help and stay with them if at risk.</li><li>In a crisis, call 112 or the Tele-MANAS helpline 14416.</li><li>Follow up and offer ongoing support.</li></ul>',
   'NIMHANS', 'https://nimhans.ac.in/', 'published', now(), true),
  ('cancer-screening-guideline','guideline','കാൻസർ സ്ക്രീനിംഗ് മാർഗരേഖ','Cancer Screening (Simplified)',
   'കാൻസർ നേരത്തെ കണ്ടെത്തലിന്റെ ലളിത സംഗ്രഹം.','A simplified summary of cancer-screening guidance.',
   '<ul><li>Screening finds cancer early, when treatment works best.</li><li>Oral: regular check-ups, especially for tobacco users.</li><li>Breast: awareness and clinical exam; mammography as advised.</li><li>Cervical: Pap smear/HPV testing and the HPV vaccine.</li><li>Discuss the right screening for your age and risk with a doctor.</li></ul>',
   'ICMR', 'https://www.icmr.gov.in/', 'published', now(), true),
  ('palliative-care-guideline','guideline','സാന്ത്വന പരിചരണ മാർഗരേഖ','Palliative Care (Simplified)',
   'സാന്ത്വന പരിചരണത്തിന്റെ ലളിത സംഗ്രഹം.','A simplified summary of palliative-care guidance.',
   '<ul><li>Palliative care improves comfort and quality of life in serious illness.</li><li>It manages pain and other symptoms alongside treatment.</li><li>It supports the family and the patient''s wishes.</li><li>Kerala has a strong community palliative-care network.</li><li>Ask your doctor for a referral to a nearby palliative unit.</li></ul>',
   'IAPC (IAPCON)', 'https://www.palliativecare.in/', 'published', now(), true)
ON CONFLICT (slug) DO NOTHING;
