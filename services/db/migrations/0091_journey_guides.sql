-- 0091_journey_guides.sql
-- Treatment Journey Guides. Reuses content_items with type='journey_guide'.
-- Additive: new column journey_steps JSONB[]; the type CHECK is widened to allow
-- 'journey_guide' (drop + recreate with all existing values preserved — no data
-- loss, no dropped table/column). Educational only.

ALTER TABLE content_items ADD COLUMN IF NOT EXISTS journey_steps jsonb[];

ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_type_check;
ALTER TABLE content_items ADD CONSTRAINT content_items_type_check
  CHECK (type IN ('article','disease','procedure','news','calculator','faq','journey_guide'));

-- Seed 5 journey guides. journey_steps: [{step_number,title_ml,title_en,
-- description_ml,description_en,duration,icon,tips}]
INSERT INTO content_items
  (slug, type, title_ml, title_en, excerpt_ml, excerpt_en, body_en,
   status, published_at, meta_title_en, meta_desc_en, requires_disclaimer, journey_steps)
VALUES
  ('knee-replacement-journey', 'journey_guide',
   'കാൽമുട്ട് മാറ്റിവയ്ക്കൽ യാത്ര', 'Knee Replacement Journey',
   'തീരുമാനം മുതൽ പൂർണ സുഖം വരെ — ഘട്ടം ഘട്ടമായി.', 'From decision to full recovery — step by step.',
   'A complete, easy-to-follow guide to what happens before, during and after a knee replacement, so you can plan with confidence. Educational only — your surgeon guides your actual care.',
   'published', now(), 'Knee Replacement Journey — Steps, Timeline, Recovery',
   'A step-by-step guide to the knee replacement journey: consultation, surgery, hospital stay, physiotherapy and recovery.', true,
   ARRAY[
     '{"step_number":1,"title_en":"Consultation & decision","title_ml":"കൺസൾട്ടേഷനും തീരുമാനവും","description_en":"An orthopaedic surgeon examines your knee, reviews X-rays and confirms whether replacement is right for you.","description_ml":"ഓർത്തോപീഡിക് സർജൻ കാൽമുട്ട് പരിശോധിച്ച് എക്സ്-റേ വിലയിരുത്തി തീരുമാനം എടുക്കുന്നു.","duration":"1-2 weeks","icon":"🩺","tips":"Ask about implant type, risks and expected recovery."}'::jsonb,
     '{"step_number":2,"title_en":"Pre-operative preparation","title_ml":"ശസ്ത്രക്രിയക്ക് മുൻപുള്ള തയ്യാറെടുപ്പ്","description_en":"Blood tests, ECG and a physician review confirm you are fit for surgery. Arrange help at home.","description_ml":"രക്തപരിശോധന, ഇസിജി, ഫിറ്റ്നസ് പരിശോധന. വീട്ടിൽ സഹായം ക്രമീകരിക്കുക.","duration":"1 week","icon":"📋","tips":"Stop certain medicines only if your doctor advises."}'::jsonb,
     '{"step_number":3,"title_en":"Surgery day","title_ml":"ശസ്ത്രക്രിയ ദിവസം","description_en":"Under spinal/regional anaesthesia the worn joint is replaced with an implant. It takes 1.5-2.5 hours.","description_ml":"റീജിയണൽ അനസ്തേഷ്യയിൽ തേഞ്ഞ സന്ധി ഇംപ്ലാന്റ് ഉപയോഗിച്ച് മാറ്റുന്നു.","duration":"1 day","icon":"🏥","tips":"You may stand with support the same or next day."}'::jsonb,
     '{"step_number":4,"title_en":"Hospital stay & early physio","title_ml":"ആശുപത്രിവാസവും ആദ്യ ഫിസിയോയും","description_en":"Physiotherapy begins within a day. Most people go home in 3-5 days walking with a frame.","description_ml":"ഒരു ദിവസത്തിനുള്ളിൽ ഫിസിയോ തുടങ്ങുന്നു. 3-5 ദിവസത്തിനുള്ളിൽ വീട്ടിലേക്ക്.","duration":"3-5 days","icon":"🚶","tips":"Do the exercises exactly as the physiotherapist shows."}'::jsonb,
     '{"step_number":5,"title_en":"Recovery at home","title_ml":"വീട്ടിലെ സുഖം പ്രാപിക്കൽ","description_en":"Daily exercises, wound care and follow-up. Most return to normal activity over 6-12 weeks.","description_ml":"ദിവസേന വ്യായാമം, മുറിവ് പരിചരണം, തുടർപരിശോധന. 6-12 ആഴ്ചയിൽ സാധാരണ ജീവിതം.","duration":"6-12 weeks","icon":"🌿","tips":"Keep follow-up appointments and report unusual pain or swelling."}'::jsonb
   ]),

  ('ivf-treatment-journey', 'journey_guide',
   'ഐവിഎഫ് ചികിത്സാ യാത്ര', 'IVF Treatment Journey',
   'ആദ്യ കൺസൾട്ടേഷൻ മുതൽ ഗർഭ പരിശോധന വരെ.', 'From first consultation to the pregnancy test.',
   'A gentle walk-through of one IVF cycle so you know what each stage involves. Educational only — your fertility team personalises everything.',
   'published', now(), 'IVF Journey — Steps, Timeline & What to Expect',
   'A step-by-step guide to the IVF journey: assessment, ovarian stimulation, egg retrieval, transfer and the pregnancy test.', true,
   ARRAY[
     '{"step_number":1,"title_en":"Assessment & planning","title_ml":"വിലയിരുത്തലും ആസൂത്രണവും","description_en":"Both partners are assessed with blood tests, scans and semen analysis to plan the cycle.","description_ml":"രണ്ട് പങ്കാളികളെയും പരിശോധിച്ച് ചികിത്സ ആസൂത്രണം ചെയ്യുന്നു.","duration":"1-2 weeks","icon":"🧪","tips":"Ask about success rates and costs for your situation."}'::jsonb,
     '{"step_number":2,"title_en":"Ovarian stimulation","title_ml":"അണ്ഡാശയ ഉത്തേജനം","description_en":"Daily hormone injections help the ovaries grow several eggs, with monitoring scans and blood tests.","description_ml":"ദിവസേന ഹോർമോൺ കുത്തിവയ്പ്പ്; സ്കാൻ വഴി നിരീക്ഷണം.","duration":"10-12 days","icon":"💉","tips":"Injections are usually given at home at a fixed time."}'::jsonb,
     '{"step_number":3,"title_en":"Egg retrieval","title_ml":"അണ്ഡം ശേഖരിക്കൽ","description_en":"Under light sedation, mature eggs are collected in a short day-care procedure.","description_ml":"ലഘു സെഡേഷനിൽ അണ്ഡങ്ങൾ ശേഖരിക്കുന്നു — ഡേ-കെയർ.","duration":"1 day","icon":"🥚","tips":"Rest for the day; mild cramping is normal."}'::jsonb,
     '{"step_number":4,"title_en":"Fertilisation & embryo transfer","title_ml":"ബീജസങ്കലനവും ഭ്രൂണ കൈമാറ്റവും","description_en":"Eggs are fertilised in the lab; a healthy embryo is placed in the uterus a few days later.","description_ml":"ലാബിൽ ബീജസങ്കലനം; കുറച്ച് ദിവസത്തിനുള്ളിൽ ഭ്രൂണം ഗർഭപാത്രത്തിൽ.","duration":"3-5 days","icon":"🌱","tips":"The transfer itself is quick and usually painless."}'::jsonb,
     '{"step_number":5,"title_en":"The two-week wait & test","title_ml":"രണ്ടാഴ്ച കാത്തിരിപ്പും പരിശോധനയും","description_en":"After about two weeks a blood pregnancy test shows the result. Continue prescribed support medicines.","description_ml":"ഏകദേശം രണ്ടാഴ്ചയ്ക്ക് ശേഷം രക്ത ഗർഭ പരിശോധന.","duration":"2 weeks","icon":"🤍","tips":"Take support medicines exactly as prescribed and stay calm."}'::jsonb
   ]),

  ('chemotherapy-journey', 'journey_guide',
   'കീമോതെറാപ്പി യാത്ര', 'Chemotherapy Journey',
   'ആസൂത്രണം മുതൽ തുടർ പരിചരണം വരെ.', 'From planning to follow-up care.',
   'An overview of what a course of chemotherapy involves and how the care team supports you at each stage. Educational only — your oncologist directs treatment.',
   'published', now(), 'Chemotherapy Journey — Cycles, Side Effects & Support',
   'A step-by-step guide to the chemotherapy journey: planning, cycles, managing side effects, monitoring and follow-up.', true,
   ARRAY[
     '{"step_number":1,"title_en":"Planning & counselling","title_ml":"ആസൂത്രണവും കൗൺസലിംഗും","description_en":"The oncologist explains the plan, number of cycles and what to expect; consent and baseline tests are done.","description_ml":"ഓങ്കോളജിസ്റ്റ് ചികിത്സാ പദ്ധതി വിശദീകരിക്കുന്നു; അടിസ്ഥാന പരിശോധനകൾ.","duration":"1 week","icon":"🗒️","tips":"Bring a family member and write down your questions."}'::jsonb,
     '{"step_number":2,"title_en":"Preparation before each cycle","title_ml":"ഓരോ സൈക്കിളിനും മുൻപ്","description_en":"Blood counts are checked before every cycle to confirm it is safe to proceed.","description_ml":"ഓരോ സൈക്കിളിനും മുൻപ് രക്തപരിശോധന.","duration":"1-2 days","icon":"🩸","tips":"Stay well hydrated and eat light, clean food."}'::jsonb,
     '{"step_number":3,"title_en":"Treatment session","title_ml":"ചികിത്സാ സെഷൻ","description_en":"Medicines are given, usually into a vein, over a planned time under close supervision.","description_ml":"മരുന്നുകൾ സാധാരണയായി സിരയിലൂടെ, മേൽനോട്ടത്തിൽ.","duration":"Few hours per cycle","icon":"💊","tips":"Tell the nurse immediately about any discomfort."}'::jsonb,
     '{"step_number":4,"title_en":"Managing side effects","title_ml":"പാർശ്വഫലങ്ങൾ കൈകാര്യം ചെയ്യൽ","description_en":"The team helps manage nausea, tiredness and infection risk between cycles.","description_ml":"സൈക്കിളുകൾക്കിടയിൽ ഓക്കാനം, ക്ഷീണം എന്നിവ കൈകാര്യം ചെയ്യാൻ സഹായം.","duration":"Ongoing","icon":"🛟","tips":"Report fever or bleeding urgently — do not wait."}'::jsonb,
     '{"step_number":5,"title_en":"Monitoring & follow-up","title_ml":"നിരീക്ഷണവും തുടർപരിചരണവും","description_en":"Scans and reviews check the response and guide next steps after the course.","description_ml":"സ്കാനുകളും അവലോകനവും വഴി ചികിത്സാ ഫലം വിലയിരുത്തുന്നു.","duration":"After the course","icon":"📈","tips":"Keep every follow-up; recovery support is available."}'::jsonb
   ]),

  ('dialysis-journey', 'journey_guide',
   'ഡയാലിസിസ് യാത്ര', 'Dialysis Journey',
   'ആരംഭം മുതൽ ദൈനംദിന ജീവിതം വരെ.', 'From starting dialysis to everyday life.',
   'A clear guide to starting and living with dialysis for kidney failure, so the routine feels less daunting. Educational only — your nephrologist plans your care.',
   'published', now(), 'Dialysis Journey — Access, Sessions & Daily Life',
   'A step-by-step guide to the dialysis journey: preparation, access creation, sessions, diet and living well.', true,
   ARRAY[
     '{"step_number":1,"title_en":"Diagnosis & preparation","title_ml":"രോഗനിർണയവും തയ്യാറെടുപ്പും","description_en":"A nephrologist confirms the need for dialysis and explains the options (haemodialysis or peritoneal).","description_ml":"നെഫ്രോളജിസ്റ്റ് ഡയാലിസിസ് ആവശ്യം സ്ഥിരീകരിക്കുന്നു.","duration":"1-2 weeks","icon":"🩺","tips":"Ask which type best suits your lifestyle."}'::jsonb,
     '{"step_number":2,"title_en":"Creating access","title_ml":"ആക്സസ് തയ്യാറാക്കൽ","description_en":"A small procedure creates a fistula in the arm (or a catheter) for repeated dialysis.","description_ml":"കൈയിൽ ഫിസ്റ്റുല അല്ലെങ്കിൽ കത്തീറ്റർ ചെറിയ നടപടിക്രമത്തിലൂടെ.","duration":"1 day (heals over weeks)","icon":"🩹","tips":"Protect the fistula arm; do not let anyone take blood from it."}'::jsonb,
     '{"step_number":3,"title_en":"Dialysis sessions begin","title_ml":"ഡയാലിസിസ് സെഷനുകൾ","description_en":"Blood is filtered by a machine over a few hours, usually two to three times a week.","description_ml":"ആഴ്ചയിൽ 2-3 തവണ, ഏതാനും മണിക്കൂർ വീതം രക്തം ശുദ്ധീകരിക്കുന്നു.","duration":"3-4 hrs/session","icon":"💧","tips":"Come on time and keep to your schedule."}'::jsonb,
     '{"step_number":4,"title_en":"Diet & fluid care","title_ml":"ആഹാരവും ദ്രാവക നിയന്ത്രണവും","description_en":"A dietician advises on salt, potassium and fluid limits to keep you well between sessions.","description_ml":"ഉപ്പ്, പൊട്ടാസ്യം, ദ്രാവകം എന്നിവയിൽ ഡയറ്റീഷ്യൻ ഉപദേശം.","duration":"Ongoing","icon":"🥗","tips":"Track your weight and fluids daily as advised."}'::jsonb,
     '{"step_number":5,"title_en":"Living well & transplant option","title_ml":"നല്ല ജീവിതവും ട്രാൻസ്പ്ലാന്റ് സാധ്യതയും","description_en":"Many people work and travel while on dialysis; a kidney transplant may be discussed if suitable.","description_ml":"ഡയാലിസിസിനിടയിലും പലരും ജോലിയും യാത്രയും ചെയ്യുന്നു; അനുയോജ്യമെങ്കിൽ ട്രാൻസ്പ്ലാന്റ്.","duration":"Ongoing","icon":"🌍","tips":"Ask your team whether transplant assessment is right for you."}'::jsonb
   ]),

  ('cardiac-bypass-journey', 'journey_guide',
   'ഹൃദയ ബൈപാസ് ശസ്ത്രക്രിയാ യാത്ര', 'Cardiac Bypass Surgery Journey',
   'തീരുമാനം മുതൽ ഹൃദയ പുനരധിവാസം വരെ.', 'From decision to cardiac rehabilitation.',
   'A supportive guide to coronary artery bypass surgery (CABG) and recovery, stage by stage. Educational only — your cardiac team leads your care.',
   'published', now(), 'Cardiac Bypass (CABG) Journey — Surgery & Recovery',
   'A step-by-step guide to the cardiac bypass journey: assessment, surgery, ICU, ward recovery and cardiac rehab.', true,
   ARRAY[
     '{"step_number":1,"title_en":"Assessment & decision","title_ml":"വിലയിരുത്തലും തീരുമാനവും","description_en":"An angiogram and cardiac team review confirm that bypass surgery is the best option.","description_ml":"ആൻജിയോഗ്രാമും ഹൃദയ സംഘത്തിന്റെ വിലയിരുത്തലും വഴി തീരുമാനം.","duration":"1-2 weeks","icon":"🫀","tips":"Ask about the number of grafts and expected recovery."}'::jsonb,
     '{"step_number":2,"title_en":"Pre-operative preparation","title_ml":"ശസ്ത്രക്രിയക്ക് മുൻപ്","description_en":"Tests, medicine adjustments and breathing exercises prepare you for surgery.","description_ml":"പരിശോധനകൾ, മരുന്ന് ക്രമീകരണം, ശ്വാസ വ്യായാമങ്ങൾ.","duration":"2-3 days","icon":"📋","tips":"Practise the breathing exercises — they aid recovery."}'::jsonb,
     '{"step_number":3,"title_en":"The surgery","title_ml":"ശസ്ത്രക്രിയ","description_en":"Under general anaesthesia, blocked arteries are bypassed using vessels from elsewhere in the body.","description_ml":"ജനറൽ അനസ്തേഷ്യയിൽ അടഞ്ഞ ധമനികൾ ബൈപാസ് ചെയ്യുന്നു.","duration":"3-5 hours","icon":"🏥","tips":"You will wake up in intensive care — this is expected."}'::jsonb,
     '{"step_number":4,"title_en":"ICU & ward recovery","title_ml":"ഐസിയുവും വാർഡ് സുഖം പ്രാപിക്കലും","description_en":"Close monitoring in ICU for 1-2 days, then the ward. Most go home in about a week.","description_ml":"1-2 ദിവസം ഐസിയു, പിന്നെ വാർഡ്. ഏകദേശം ഒരാഴ്ചയിൽ വീട്ടിലേക്ക്.","duration":"5-7 days","icon":"🩺","tips":"Support your chest with a pillow when coughing."}'::jsonb,
     '{"step_number":5,"title_en":"Cardiac rehabilitation","title_ml":"ഹൃദയ പുനരധിവാസം","description_en":"A guided programme of gradual exercise, diet and lifestyle change strengthens your heart over weeks.","description_ml":"ക്രമേണയുള്ള വ്യായാമം, ആഹാരം, ജീവിതശൈലി മാറ്റം.","duration":"6-12 weeks","icon":"🌿","tips":"Attend cardiac rehab and take medicines regularly."}'::jsonb
   ])
ON CONFLICT (slug) DO NOTHING;

-- Map journeys to a specialty (for related specialists).
INSERT INTO content_item_specialties (content_item_id, specialty_id)
SELECT c.id, s.id FROM content_items c, specialties s
 WHERE (c.slug, s.slug) IN (
   VALUES ('knee-replacement-journey','orthopedics'),
          ('ivf-treatment-journey','gynecology'),
          ('chemotherapy-journey','general-surgery'),
          ('dialysis-journey','general-physician'),
          ('cardiac-bypass-journey','cardiology'))
ON CONFLICT DO NOTHING;
