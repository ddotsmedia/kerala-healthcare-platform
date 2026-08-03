-- 0086_medicines.sql
-- Medicine Information Centre — educational drug information. Additive only.
-- EDUCATIONAL ONLY, never prescriptive; the app renders a mandatory red
-- non-dismissable disclaimer on every medicine page.

CREATE TABLE IF NOT EXISTS medicines (
  id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                     varchar(255) UNIQUE NOT NULL,
  generic_name_ml          text,
  generic_name_en          text NOT NULL,
  brand_names              text[],
  drug_class               varchar(100),
  therapeutic_category     varchar(100),   -- antibiotics|diabetes|heart|pain|allergy|gastrointestinal|...
  uses_ml                  text,
  uses_en                  text,
  mechanism_ml             text,
  mechanism_en             text,
  dosage_forms             text[],         -- tablet|capsule|injection|syrup|cream|...
  common_side_effects_ml   text[],
  common_side_effects_en   text[],
  serious_side_effects_ml  text[],
  serious_side_effects_en  text[],
  contraindications_ml     text,
  contraindications_en     text,
  interactions_ml          text,
  interactions_en          text,
  pregnancy_category       varchar(10),    -- A|B|C|D|X (FDA categories)
  is_otc                   boolean DEFAULT false,
  storage_ml               text,
  storage_en               text,
  disclaimer_ml            text,
  disclaimer_en            text,
  "references"             text[],
  is_published             boolean DEFAULT false,
  reviewed_by_doctor       boolean DEFAULT false,
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz,
  deleted_at               timestamptz
);

CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines (therapeutic_category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_medicines_generic_lower ON medicines (lower(generic_name_en)) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_medicines_brands ON medicines USING gin (brand_names) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_medicines_generic_trgm ON medicines USING gin (generic_name_en gin_trgm_ops) WHERE deleted_at IS NULL;

-- Seed: 30 common medicines in Kerala. Educational summaries; storage/disclaimer
-- handled by the app UI. references cite standard sources.
INSERT INTO medicines
  (slug, generic_name_ml, generic_name_en, brand_names, drug_class, therapeutic_category,
   uses_ml, uses_en, mechanism_en, dosage_forms, common_side_effects_en, serious_side_effects_en,
   contraindications_en, interactions_en, pregnancy_category, is_otc, storage_en, "references",
   is_published, reviewed_by_doctor)
VALUES
  ('paracetamol', 'പാരസെറ്റമോൾ', 'Paracetamol', ARRAY['Crocin','Dolo 650','Calpol','Metacin'], 'Analgesic / Antipyretic', 'pain',
   'പനി, നേരിയ മുതൽ മിതമായ വേദന എന്നിവയ്ക്ക്.', 'Relief of fever and mild-to-moderate pain such as headache, body ache and toothache.',
   'Thought to reduce prostaglandin production in the central nervous system, lowering pain signalling and fever.',
   ARRAY['tablet','syrup','injection','suppository'], ARRAY['Nausea','Rash (uncommon)'], ARRAY['Liver damage in overdose','Severe skin reactions (rare)'],
   'Severe liver disease; known hypersensitivity.', 'High doses with alcohol or warfarin increase risk; avoid other paracetamol-containing products.',
   'B', true, 'Store below 30°C, away from moisture and light.', ARRAY['WHO Model List of Essential Medicines','ICMR'], true, true),

  ('ibuprofen', 'ഐബുപ്രോഫെൻ', 'Ibuprofen', ARRAY['Brufen','Combiflam','Ibugesic'], 'NSAID', 'pain',
   'വേദന, വീക്കം, പനി എന്നിവയ്ക്ക്.', 'Pain, inflammation and fever — including muscle pain, arthritis and menstrual cramps.',
   'Blocks COX enzymes, reducing prostaglandins that cause pain, inflammation and fever.',
   ARRAY['tablet','syrup','gel'], ARRAY['Stomach upset','Heartburn','Dizziness'], ARRAY['Gastrointestinal bleeding','Kidney impairment','Cardiovascular events'],
   'Active peptic ulcer; severe kidney or heart failure; third trimester of pregnancy.', 'Increases bleeding risk with anticoagulants; reduces effect of some blood-pressure medicines.',
   'C', true, 'Store below 25°C.', ARRAY['WHO','British National Formulary'], true, true),

  ('aspirin', 'ആസ്പിരിൻ', 'Aspirin', ARRAY['Ecosprin','Disprin','Aspicot'], 'NSAID / Antiplatelet', 'heart',
   'വേദന, പനി; കുറഞ്ഞ ഡോസിൽ ഹൃദയ സംരക്ഷണത്തിന്.', 'Pain and fever relief; in low dose, to reduce risk of heart attack and stroke.',
   'Irreversibly inhibits COX and platelet aggregation, reducing clot formation.',
   ARRAY['tablet'], ARRAY['Stomach irritation','Heartburn'], ARRAY['Gastrointestinal bleeding','Reye syndrome in children'],
   'Children with viral illness; active bleeding; peptic ulcer.', 'Increased bleeding with other anticoagulants/NSAIDs.',
   'C', true, 'Store in a dry place below 25°C.', ARRAY['WHO','American Heart Association'], true, true),

  ('diclofenac', 'ഡിക്ലോഫെനാക്', 'Diclofenac', ARRAY['Voveran','Volini','Dynapar'], 'NSAID', 'pain',
   'വേദനയും വീക്കവും (സന്ധിവാതം, പരിക്കുകൾ).', 'Pain and inflammation from arthritis, injuries and post-operative pain.',
   'Inhibits COX enzymes to reduce prostaglandin-mediated pain and inflammation.',
   ARRAY['tablet','injection','gel'], ARRAY['Stomach upset','Headache'], ARRAY['GI bleeding','Cardiovascular risk','Kidney impairment'],
   'Active ulcer; severe heart failure; late pregnancy.', 'Avoid with other NSAIDs; caution with diuretics and lithium.',
   'C', false, 'Store below 30°C.', ARRAY['British National Formulary'], true, true),

  ('amoxicillin', 'അമോക്സിസിലിൻ', 'Amoxicillin', ARRAY['Mox','Novamox','Amoxil'], 'Penicillin antibiotic', 'antibiotics',
   'ബാക്ടീരിയ അണുബാധകൾക്ക് (തൊണ്ട, ചെവി, ശ്വാസകോശം).', 'Bacterial infections of the throat, ear, chest, sinuses and urinary tract.',
   'Inhibits bacterial cell-wall synthesis, killing susceptible bacteria.',
   ARRAY['capsule','tablet','syrup','injection'], ARRAY['Diarrhoea','Nausea','Rash'], ARRAY['Severe allergic reaction (anaphylaxis)','C. difficile colitis'],
   'Known penicillin allergy.', 'May reduce effectiveness of oral contraceptives; interacts with allopurinol.',
   'B', false, 'Store below 25°C; reconstituted syrup refrigerate and discard after 7 days.', ARRAY['WHO','ICMR AMR guidelines'], true, true),

  ('azithromycin', 'അസിത്രോമൈസിൻ', 'Azithromycin', ARRAY['Azithral','Zithromax','Azee'], 'Macrolide antibiotic', 'antibiotics',
   'ശ്വാസകോശ, തൊലി, ചില ലൈംഗിക അണുബാധകൾക്ക്.', 'Respiratory, skin and certain sexually transmitted bacterial infections.',
   'Inhibits bacterial protein synthesis by binding the 50S ribosomal subunit.',
   ARRAY['tablet','syrup'], ARRAY['Nausea','Abdominal pain','Diarrhoea'], ARRAY['QT prolongation','Liver injury (rare)'],
   'Known macrolide allergy; significant liver disease.', 'Caution with QT-prolonging drugs and antacids.',
   'B', false, 'Store below 30°C.', ARRAY['WHO','ICMR'], true, true),

  ('metronidazole', 'മെട്രോണിഡസോൾ', 'Metronidazole', ARRAY['Flagyl','Metrogyl','Aristogyl'], 'Nitroimidazole antibiotic', 'antibiotics',
   'ചില ബാക്ടീരിയ, അമീബ അണുബാധകൾക്ക്.', 'Anaerobic bacterial and protozoal infections including amoebiasis and giardiasis.',
   'Damages microbial DNA in anaerobic organisms, causing cell death.',
   ARRAY['tablet','injection','syrup'], ARRAY['Metallic taste','Nausea','Dark urine'], ARRAY['Peripheral neuropathy','Seizures (rare)'],
   'First trimester of pregnancy; known allergy.', 'Severe reaction with alcohol (avoid alcohol during and 48h after).',
   'B', false, 'Store below 25°C, protected from light.', ARRAY['WHO'], true, true),

  ('ciprofloxacin', 'സിപ്രോഫ്ലോക്സാസിൻ', 'Ciprofloxacin', ARRAY['Ciplox','Cifran','Ciprobid'], 'Fluoroquinolone antibiotic', 'antibiotics',
   'മൂത്രനാളി, കുടൽ അണുബാധകൾക്ക്.', 'Urinary tract, gastrointestinal and certain respiratory infections.',
   'Inhibits bacterial DNA gyrase and topoisomerase, stopping replication.',
   ARRAY['tablet','injection','eye drops'], ARRAY['Nausea','Diarrhoea','Dizziness'], ARRAY['Tendon rupture','QT prolongation','Nerve damage'],
   'Children/adolescents unless essential; known allergy.', 'Antacids and dairy reduce absorption; increases theophylline levels.',
   'C', false, 'Store below 30°C.', ARRAY['ICMR AMR guidelines'], true, true),

  ('doxycycline', 'ഡോക്സിസൈക്ലിൻ', 'Doxycycline', ARRAY['Doxt','Minicycline','Doxy-1'], 'Tetracycline antibiotic', 'antibiotics',
   'ചില അണുബാധകൾ, മുഖക്കുരു, മലേറിയ പ്രതിരോധം.', 'Acne, respiratory and tick-borne infections, and malaria prevention.',
   'Inhibits bacterial protein synthesis by binding the 30S ribosomal subunit.',
   ARRAY['capsule','tablet'], ARRAY['Nausea','Photosensitivity','Throat irritation'], ARRAY['Severe skin reaction','Liver injury (rare)'],
   'Pregnancy; children under 8; known allergy.', 'Antacids, iron and dairy reduce absorption.',
   'D', false, 'Store below 25°C; take with plenty of water, stay upright.', ARRAY['WHO'], true, true),

  ('cefixime', 'സെഫിക്സിം', 'Cefixime', ARRAY['Taxim-O','Zifi','Mahacef'], 'Cephalosporin antibiotic', 'antibiotics',
   'തൊണ്ട, മൂത്രനാളി, ചെവി അണുബാധകൾക്ക്.', 'Throat, urinary tract, ear and some respiratory infections.',
   'Inhibits bacterial cell-wall synthesis.',
   ARRAY['tablet','syrup'], ARRAY['Diarrhoea','Nausea','Abdominal pain'], ARRAY['Severe allergic reaction','C. difficile colitis'],
   'Known cephalosporin allergy.', 'Caution with anticoagulants.',
   'B', false, 'Store below 30°C.', ARRAY['ICMR'], true, true),

  ('metformin', 'മെറ്റ്ഫോർമിൻ', 'Metformin', ARRAY['Glycomet','Gluconorm','Glucophage'], 'Biguanide', 'diabetes',
   'ടൈപ്പ് 2 പ്രമേഹത്തിന്റെ ആദ്യ ചികിത്സ.', 'First-line treatment of type 2 diabetes to lower blood sugar.',
   'Reduces glucose production by the liver and improves insulin sensitivity.',
   ARRAY['tablet'], ARRAY['Nausea','Diarrhoea','Metallic taste'], ARRAY['Lactic acidosis (rare)','Vitamin B12 deficiency'],
   'Severe kidney impairment; acute metabolic acidosis.', 'Caution with contrast dyes and alcohol.',
   'B', false, 'Store below 30°C.', ARRAY['WHO','ADA Standards of Care'], true, true),

  ('glimepiride', 'ഗ്ലിമെപിറൈഡ്', 'Glimepiride', ARRAY['Amaryl','Glimestar','Zoryl'], 'Sulfonylurea', 'diabetes',
   'ടൈപ്പ് 2 പ്രമേഹത്തിന് (പലപ്പോഴും മെറ്റ്ഫോർമിനൊപ്പം).', 'Type 2 diabetes, often combined with metformin, to lower blood sugar.',
   'Stimulates the pancreas to release more insulin.',
   ARRAY['tablet'], ARRAY['Low blood sugar','Weight gain','Nausea'], ARRAY['Severe hypoglycaemia'],
   'Type 1 diabetes; diabetic ketoacidosis.', 'Alcohol and some antibiotics increase hypoglycaemia risk.',
   'C', false, 'Store below 30°C.', ARRAY['ADA Standards of Care'], true, true),

  ('atenolol', 'അറ്റെനോലോൾ', 'Atenolol', ARRAY['Aten','Tenormin','Betacard'], 'Beta blocker', 'heart',
   'ഉയർന്ന രക്തസമ്മർദ്ദം, നെഞ്ചുവേദന (ആൻജൈന).', 'High blood pressure and angina (chest pain).',
   'Blocks beta-adrenergic receptors, slowing heart rate and lowering blood pressure.',
   ARRAY['tablet'], ARRAY['Tiredness','Cold hands','Slow heart rate'], ARRAY['Severe bradycardia','Worsening heart failure'],
   'Asthma; very slow heart rate; certain heart blocks.', 'Caution with other heart-rate-lowering drugs.',
   'D', false, 'Store below 30°C.', ARRAY['WHO'], true, true),

  ('amlodipine', 'അംലോഡിപ്പിൻ', 'Amlodipine', ARRAY['Amlong','Amlopres','Stamlo'], 'Calcium channel blocker', 'heart',
   'ഉയർന്ന രക്തസമ്മർദ്ദവും ആൻജൈനയും.', 'High blood pressure and angina.',
   'Relaxes blood-vessel walls by blocking calcium entry, lowering blood pressure.',
   ARRAY['tablet'], ARRAY['Ankle swelling','Flushing','Headache'], ARRAY['Severe low blood pressure (rare)'],
   'Severe aortic stenosis; known allergy.', 'Grapefruit juice and some antifungals raise its level.',
   'C', false, 'Store below 30°C, protect from light.', ARRAY['WHO'], true, true),

  ('atorvastatin', 'അറ്റോർവാസ്റ്റാറ്റിൻ', 'Atorvastatin', ARRAY['Atorva','Lipitor','Storvas'], 'Statin', 'heart',
   'ഉയർന്ന കൊളസ്ട്രോൾ കുറയ്ക്കാൻ.', 'Lowering high cholesterol and reducing cardiovascular risk.',
   'Inhibits HMG-CoA reductase, reducing cholesterol production in the liver.',
   ARRAY['tablet'], ARRAY['Muscle ache','Headache','Digestive upset'], ARRAY['Rhabdomyolysis (rare)','Liver injury'],
   'Active liver disease; pregnancy and breastfeeding.', 'Avoid grapefruit; caution with certain antibiotics/antifungals.',
   'X', false, 'Store below 30°C.', ARRAY['WHO','ACC/AHA guidelines'], true, true),

  ('losartan', 'ലോസാർട്ടൻ', 'Losartan', ARRAY['Losar','Repace','Cozaar'], 'ARB', 'heart',
   'ഉയർന്ന രക്തസമ്മർദ്ദവും വൃക്ക സംരക്ഷണവും.', 'High blood pressure and kidney protection in diabetes.',
   'Blocks angiotensin II receptors, relaxing blood vessels.',
   ARRAY['tablet'], ARRAY['Dizziness','Fatigue'], ARRAY['High potassium','Kidney impairment'],
   'Pregnancy; known allergy.', 'Caution with potassium supplements and NSAIDs.',
   'D', false, 'Store below 30°C.', ARRAY['WHO'], true, true),

  ('telmisartan', 'ടെൽമിസാർട്ടൻ', 'Telmisartan', ARRAY['Telma','Telsar','Tazloc'], 'ARB', 'heart',
   'ഉയർന്ന രക്തസമ്മർദ്ദത്തിന്.', 'High blood pressure and cardiovascular risk reduction.',
   'Blocks angiotensin II receptors, lowering blood pressure.',
   ARRAY['tablet'], ARRAY['Dizziness','Back pain'], ARRAY['High potassium','Kidney impairment'],
   'Pregnancy; biliary obstruction.', 'Caution with potassium-sparing diuretics and NSAIDs.',
   'D', false, 'Store below 30°C.', ARRAY['WHO'], true, true),

  ('omeprazole', 'ഒമെപ്രാസോൾ', 'Omeprazole', ARRAY['Omez','Ocid','Omecip'], 'Proton pump inhibitor', 'gastrointestinal',
   'അസിഡിറ്റി, അൾസർ, ഗ്യാസ്ട്രിക് പ്രശ്നങ്ങൾക്ക്.', 'Acidity, gastric/duodenal ulcers and acid reflux (GERD).',
   'Blocks the stomach proton pump, reducing acid production.',
   ARRAY['capsule','tablet','injection'], ARRAY['Headache','Nausea','Diarrhoea'], ARRAY['Low magnesium (long term)','Increased fracture risk (long term)'],
   'Known allergy.', 'Reduces effect of clopidogrel; affects some antifungals.',
   'C', true, 'Store below 25°C.', ARRAY['WHO'], true, true),

  ('pantoprazole', 'പാന്റോപ്രാസോൾ', 'Pantoprazole', ARRAY['Pan','Pantop','Pantocid'], 'Proton pump inhibitor', 'gastrointestinal',
   'അസിഡിറ്റിയും റിഫ്ലക്സും.', 'Acid reflux, ulcers and acidity.',
   'Blocks the stomach proton pump to reduce acid.',
   ARRAY['tablet','injection'], ARRAY['Headache','Diarrhoea'], ARRAY['Low magnesium (long term)'],
   'Known allergy.', 'May affect drugs needing stomach acid for absorption.',
   'B', false, 'Store below 25°C.', ARRAY['WHO'], true, true),

  ('domperidone', 'ഡോംപെരിഡോൺ', 'Domperidone', ARRAY['Domstal','Motilium','Vomistop'], 'Prokinetic / Antiemetic', 'gastrointestinal',
   'ഛർദ്ദി, ഓക്കാനം, ദഹനക്കേട്.', 'Nausea, vomiting and indigestion.',
   'Blocks dopamine receptors in the gut and vomiting centre.',
   ARRAY['tablet','syrup'], ARRAY['Dry mouth','Headache'], ARRAY['QT prolongation','Irregular heartbeat'],
   'Significant heart-rhythm problems; known allergy.', 'Caution with QT-prolonging drugs and certain antifungals.',
   'C', false, 'Store below 30°C.', ARRAY['British National Formulary'], true, true),

  ('ondansetron', 'ഒൻഡാൻസെട്രോൺ', 'Ondansetron', ARRAY['Emeset','Vomiz','Ondem'], 'Antiemetic', 'gastrointestinal',
   'ശക്തമായ ഛർദ്ദിക്ക് (കീമോ, ശസ്ത്രക്രിയ).', 'Nausea and vomiting from chemotherapy, surgery or severe gastroenteritis.',
   'Blocks serotonin (5-HT3) receptors involved in the vomiting reflex.',
   ARRAY['tablet','injection','syrup'], ARRAY['Headache','Constipation'], ARRAY['QT prolongation'],
   'Known allergy; congenital long QT.', 'Caution with other QT-prolonging drugs.',
   'B', false, 'Store below 30°C.', ARRAY['WHO'], true, true),

  ('cetirizine', 'സെറ്റിരിസിൻ', 'Cetirizine', ARRAY['Cetzine','Alerid','Okacet'], 'Antihistamine', 'allergy',
   'അലർജി, തുമ്മൽ, മൂക്കൊലിപ്പ്, ചൊറിച്ചിൽ.', 'Allergies — sneezing, runny nose, itching and hives.',
   'Blocks H1 histamine receptors, reducing allergic symptoms.',
   ARRAY['tablet','syrup'], ARRAY['Drowsiness','Dry mouth'], ARRAY['Severe drowsiness (uncommon)'],
   'Known allergy; severe kidney disease (dose adjust).', 'Alcohol and sedatives increase drowsiness.',
   'B', true, 'Store below 30°C.', ARRAY['WHO'], true, true),

  ('levocetirizine', 'ലെവോസെറ്റിരിസിൻ', 'Levocetirizine', ARRAY['Levocet','Xyzal','1-Al'], 'Antihistamine', 'allergy',
   'അലർജിക് റൈനൈറ്റിസ്, ചൊറിച്ചിൽ.', 'Allergic rhinitis and chronic hives.',
   'Selectively blocks H1 histamine receptors.',
   ARRAY['tablet','syrup'], ARRAY['Drowsiness','Dry mouth','Fatigue'], ARRAY['Severe drowsiness (uncommon)'],
   'Severe kidney disease; known allergy.', 'Alcohol and sedatives increase drowsiness.',
   'B', true, 'Store below 30°C.', ARRAY['British National Formulary'], true, true),

  ('montelukast', 'മോണ്ടെലുകാസ്റ്റ്', 'Montelukast', ARRAY['Montair','Montek','Romilast'], 'Leukotriene antagonist', 'allergy',
   'ആസ്ത്മ, അലർജിക് റൈനൈറ്റിസ് പ്രതിരോധം.', 'Preventing asthma symptoms and allergic rhinitis.',
   'Blocks leukotrienes, reducing airway inflammation and constriction.',
   ARRAY['tablet','chewable'], ARRAY['Headache','Abdominal pain'], ARRAY['Mood or behaviour changes'],
   'Known allergy.', 'Generally few; caution with certain enzyme inducers.',
   'B', false, 'Store below 25°C, protect from moisture.', ARRAY['GINA guidelines'], true, true),

  ('salbutamol', 'സാൽബ്യൂട്ടമോൾ', 'Salbutamol', ARRAY['Asthalin','Ventolin','Levolin'], 'Bronchodilator', 'respiratory',
   'ആസ്ത്മ, ശ്വാസതടസ്സം ഒഴിവാക്കാൻ.', 'Quick relief of asthma and breathing difficulty (wheezing).',
   'Stimulates beta-2 receptors to relax and open the airways.',
   ARRAY['inhaler','syrup','tablet','nebuliser solution'], ARRAY['Tremor','Fast heartbeat','Headache'], ARRAY['Severe low potassium','Irregular heartbeat'],
   'Known allergy.', 'Caution with beta blockers and diuretics.',
   'C', false, 'Store below 30°C; keep inhaler away from heat.', ARRAY['GINA guidelines','WHO'], true, true),

  ('levothyroxine', 'ലെവോതൈറോക്സിൻ', 'Levothyroxine', ARRAY['Thyronorm','Eltroxin','Thyrox'], 'Thyroid hormone', 'hormonal',
   'തൈറോയ്ഡ് ഹോർമോൺ കുറവിന് (ഹൈപ്പോതൈറോയ്ഡിസം).', 'Replacement for underactive thyroid (hypothyroidism).',
   'Replaces thyroid hormone (T4), restoring normal metabolism.',
   ARRAY['tablet'], ARRAY['Usually none at correct dose'], ARRAY['Palpitations or tremor if over-dosed'],
   'Untreated adrenal insufficiency; known allergy.', 'Iron, calcium and antacids reduce absorption — separate doses.',
   'A', false, 'Store below 25°C; take on an empty stomach.', ARRAY['WHO'], true, true),

  ('prednisolone', 'പ്രെഡ്നിസോലോൺ', 'Prednisolone', ARRAY['Wysolone','Omnacortil','Predmet'], 'Corticosteroid', 'anti-inflammatory',
   'ശക്തമായ വീക്കം, അലർജി, സ്വയം രോഗപ്രതിരോധ അവസ്ഥകൾ.', 'Severe inflammation, allergic and autoimmune conditions.',
   'Suppresses inflammation and immune activity.',
   ARRAY['tablet','syrup'], ARRAY['Increased appetite','Mood changes','Raised blood sugar'], ARRAY['Adrenal suppression','Infections','Osteoporosis (long term)'],
   'Systemic fungal infection; live vaccines during treatment.', 'Do not stop abruptly; interacts with NSAIDs and diabetes drugs.',
   'C', false, 'Store below 30°C.', ARRAY['British National Formulary'], true, true),

  ('acyclovir', 'അസൈക്ലോവിർ', 'Acyclovir', ARRAY['Zovirax','Acivir','Herpex'], 'Antiviral', 'antivirals',
   'ഹെർപ്പിസ്, ചിക്കൻപോക്സ്, ഷിംഗിൾസ് വൈറസ് അണുബാധകൾക്ക്.', 'Herpes simplex, chickenpox and shingles viral infections.',
   'Inhibits viral DNA replication in infected cells.',
   ARRAY['tablet','cream','injection'], ARRAY['Nausea','Headache'], ARRAY['Kidney impairment (high doses)'],
   'Known allergy.', 'Maintain good hydration; caution with other nephrotoxic drugs.',
   'B', false, 'Store below 25°C.', ARRAY['WHO'], true, true),

  ('folic-acid', 'ഫോളിക് ആസിഡ്', 'Folic Acid', ARRAY['Folvite','Folinext','Livogen (combo)'], 'Vitamin B9', 'supplements',
   'ഗർഭകാലത്ത്, വിളർച്ചയ്ക്ക്.', 'Preventing neural-tube defects in pregnancy and treating folate-deficiency anaemia.',
   'Provides folate needed for red-blood-cell and DNA formation.',
   ARRAY['tablet'], ARRAY['Usually none'], ARRAY['Allergic reaction (rare)'],
   'Untreated vitamin B12 deficiency (may mask it).', 'Some anti-epileptics reduce folate levels.',
   'A', true, 'Store below 30°C.', ARRAY['WHO','ICMR'], true, true),

  ('ranitidine', 'റാനിറ്റിഡിൻ', 'Ranitidine', ARRAY['Rantac','Aciloc','Zinetac'], 'H2 blocker', 'gastrointestinal',
   'അസിഡിറ്റിയും അൾസറും (ലഭ്യത പ്രാദേശികമായി വ്യത്യാസപ്പെടാം).', 'Acidity and ulcers (availability may vary by region).',
   'Blocks H2 histamine receptors in the stomach, reducing acid.',
   ARRAY['tablet','syrup','injection'], ARRAY['Headache','Constipation'], ARRAY['Rare blood or liver effects'],
   'Known allergy.', 'May affect absorption of drugs needing stomach acid.',
   'B', true, 'Store below 25°C.', ARRAY['British National Formulary'], true, true),

  ('dolo-650', 'പാരസെറ്റമോൾ 650', 'Paracetamol 650', ARRAY['Dolo 650','Crocin 650'], 'Analgesic / Antipyretic', 'pain',
   'പനിയും വേദനയും (ഉയർന്ന ഡോസ് പാരസെറ്റമോൾ).', 'Fever and pain — a higher (650 mg) strength of paracetamol.',
   'Same as paracetamol — reduces central prostaglandins to lower pain and fever.',
   ARRAY['tablet'], ARRAY['Nausea'], ARRAY['Liver damage in overdose'],
   'Severe liver disease.', 'Do not combine with other paracetamol products; caution with alcohol.',
   'B', true, 'Store below 30°C.', ARRAY['WHO'], true, true),

  ('ors', 'ഒആർഎസ്', 'Oral Rehydration Salts', ARRAY['ORS','Electral','Enerzal'], 'Rehydration', 'gastrointestinal',
   'വയറിളക്കം മൂലമുള്ള നിർജ്ജലീകരണത്തിന്.', 'Preventing and treating dehydration from diarrhoea and vomiting.',
   'Replaces water and electrolytes lost through diarrhoea/vomiting.',
   ARRAY['powder','ready solution'], ARRAY['Usually none'], ARRAY['High sodium if mixed incorrectly'],
   'Severe dehydration needing IV fluids; intestinal obstruction.', 'Mix with the correct volume of clean water only.',
   'A', true, 'Store the sachet dry; use prepared solution within 24 hours.', ARRAY['WHO','UNICEF'], true, true)
ON CONFLICT (slug) DO NOTHING;
