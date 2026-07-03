#!/usr/bin/env bash
# seed-prod.sh — idempotent production content seed (articles, symptoms, whatsapp).
# Safe to run repeatedly (WHERE NOT EXISTS / ON CONFLICT DO NOTHING).
# Runs migrations 0034/0035 first via pnpm if DATABASE_URL is set; otherwise assumes
# migrations already applied. Uses the khp-postgres container when psql is absent.
set -euo pipefail

run_sql() {
  if [ -n "${DATABASE_URL:-}" ] && command -v psql >/dev/null 2>&1; then
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1
  else
    docker exec -i khp-khp-postgres-1 psql -U khp -d khp -v ON_ERROR_STOP=1
  fi
}

run_sql <<'SQL'
-- ===== A3: public WhatsApp numbers for demo doctors =====
UPDATE doctors SET whatsapp_number='919847012345' WHERE slug='dr-anand-nair-cardiology-ernakulam' AND whatsapp_number IS NULL;
UPDATE doctors SET whatsapp_number='919847023456' WHERE slug='dr-meera-pillai-pediatrics-thiruvananthapuram' AND whatsapp_number IS NULL;
UPDATE doctors SET whatsapp_number='919847034567' WHERE slug='dr-rahul-menon-dermatology-kozhikode' AND whatsapp_number IS NULL;

-- ===== Backfill category on existing content =====
UPDATE content_items SET category='disease' WHERE type='disease' AND category IS NULL AND deleted_at IS NULL;
UPDATE content_items SET category='news'    WHERE type='article' AND category IS NULL AND deleted_at IS NULL;

-- ===== B3: 10 health articles =====
INSERT INTO content_items
  (slug, type, category, title_ml, title_en, excerpt_ml, excerpt_en, body_ml, body_en,
   status, published_at, author_id, meta_title_en, meta_desc_en)
SELECT v.slug, 'article', v.cat, v.tml, v.ten, v.eml, v.een, v.bml, v.ben,
       'published', now(),
       (SELECT id FROM users WHERE role='platform_admin' ORDER BY created_at LIMIT 1),
       v.ten, v.een
  FROM (VALUES
    ('diabetes-management','nutrition','പ്രമേഹ പരിചരണം','Managing Diabetes','പ്രമേഹം നിയന്ത്രിക്കാൻ ഭക്ഷണവും വ്യായാമവും','Diet and exercise to control diabetes',
     '<h2>ആമുഖം</h2><p>പ്രമേഹം ദീർഘകാല അവസ്ഥയാണ്. സമീകൃത ഭക്ഷണം, ക്രമമായ വ്യായാമം, മരുന്ന് എന്നിവയിലൂടെ നിയന്ത്രിക്കാം.</p><h2>ഭക്ഷണം</h2><p>ധാന്യങ്ങൾ, പച്ചക്കറികൾ തിരഞ്ഞെടുക്കുക; പഞ്ചസാര കുറയ്ക്കുക.</p>',
     '<h2>Overview</h2><p>Diabetes is a long-term condition managed through balanced diet, regular activity and medication.</p><h2>Diet</h2><p>Choose whole grains and vegetables; limit added sugar.</p>'),
    ('heart-health-basics-2','disease','ഹൃദയാരോഗ്യം','Heart Health Basics','ഹൃദയം ആരോഗ്യമായി സൂക്ഷിക്കാൻ','Keeping your heart healthy',
     '<h2>ഹൃദയാരോഗ്യം</h2><p>പതിവ് വ്യായാമം, ഉപ്പ് കുറയ്ക്കൽ, പുകവലി ഒഴിവാക്കൽ ഹൃദയത്തെ സംരക്ഷിക്കുന്നു.</p><h2>പരിശോധന</h2><p>രക്തസമ്മർദ്ദവും കൊളസ്ട്രോളും ക്രമമായി പരിശോധിക്കുക.</p>',
     '<h2>Heart health</h2><p>Regular exercise, less salt and no smoking protect your heart.</p><h2>Screening</h2><p>Check blood pressure and cholesterol regularly.</p>'),
    ('mental-health-awareness','mental-health','മാനസികാരോഗ്യ അവബോധം','Mental Health Awareness','മാനസികാരോഗ്യം പ്രധാനമാണ്','Mental health matters',
     '<h2>അവബോധം</h2><p>സമ്മർദ്ദം, ഉത്കണ്ഠ, വിഷാദം സാധാരണമാണ്. സഹായം തേടുന്നത് ബലഹീനതയല്ല.</p><h2>പിന്തുണ</h2><p>ഉറക്കം, വ്യായാമം, സംസാരം എന്നിവ സഹായിക്കും.</p>',
     '<h2>Awareness</h2><p>Stress, anxiety and low mood are common. Seeking help is not weakness.</p><h2>Support</h2><p>Sleep, exercise and talking help.</p>'),
    ('child-vaccination-2','child-health','കുട്ടികളുടെ വാക്സിനേഷൻ','Child Vaccination','സമയബന്ധിത വാക്സിനേഷൻ','Timely childhood vaccines',
     '<h2>വാക്സിനേഷൻ</h2><p>വാക്സിനുകൾ ഗുരുതര രോഗങ്ങളിൽ നിന്ന് കുട്ടികളെ സംരക്ഷിക്കുന്നു. സമയക്രമം പാലിക്കുക.</p><h2>ശ്രദ്ധിക്കുക</h2><p>നേരിയ പനി സാധാരണം; സംശയമുണ്ടെങ്കിൽ ഡോക്ടറെ കാണുക.</p>',
     '<h2>Vaccines</h2><p>Vaccines protect children from serious illness. Follow the schedule.</p><h2>Note</h2><p>Mild fever is common; see a doctor if unsure.</p>'),
    ('womens-health-guide','womens-health','സ്ത്രീ ആരോഗ്യം','Women''s Health Guide','സ്ത്രീകളുടെ ആരോഗ്യ പരിചരണം','Care for women''s health',
     '<h2>ആരോഗ്യം</h2><p>ക്രമമായ പരിശോധന, പോഷകാഹാരം, വ്യായാമം സ്ത്രീ ആരോഗ്യത്തിന് പ്രധാനം.</p><h2>പരിശോധന</h2><p>ഡോക്ടറുടെ നിർദേശപ്രകാരം സ്ക്രീനിംഗ് നടത്തുക.</p>',
     '<h2>Health</h2><p>Regular check-ups, nutrition and exercise are key to women''s health.</p><h2>Screening</h2><p>Follow your doctor''s screening advice.</p>'),
    ('ayurveda-basics','ayurveda','ആയുർവേദ അടിസ്ഥാനം','Ayurveda Basics','ആയുർവേദത്തിന്റെ അടിസ്ഥാനം','Introduction to Ayurveda',
     '<h2>ആയുർവേദം</h2><p>സന്തുലിത ജീവിതശൈലിക്ക് ഊന്നൽ നൽകുന്ന പരമ്പരാഗത ചികിത്സാ സമ്പ്രദായം.</p><h2>ശ്രദ്ധിക്കുക</h2><p>യോഗ്യതയുള്ള വൈദ്യന്റെ ഉപദേശം തേടുക.</p>',
     '<h2>Ayurveda</h2><p>A traditional system emphasising a balanced lifestyle.</p><h2>Note</h2><p>Consult a qualified practitioner.</p>'),
    ('cancer-awareness','disease','കാൻസർ അവബോധം','Cancer Awareness','നേരത്തെ കണ്ടെത്തൽ പ്രധാനം','Early detection matters',
     '<h2>അവബോധം</h2><p>നേരത്തെ കണ്ടെത്തുന്നത് ചികിത്സ ഫലപ്രദമാക്കുന്നു. മുന്നറിയിപ്പ് ലക്ഷണങ്ങൾ അവഗണിക്കരുത്.</p><h2>കുറയ്ക്കൽ</h2><p>പുകവലി ഒഴിവാക്കുക, ആരോഗ്യകരമായ ഭക്ഷണം.</p>',
     '<h2>Awareness</h2><p>Early detection improves outcomes. Do not ignore warning signs.</p><h2>Reduce risk</h2><p>Avoid tobacco and eat healthily.</p>'),
    ('blood-pressure-control','disease','രക്തസമ്മർദ്ദം','Controlling Blood Pressure','രക്തസമ്മർദ്ദം നിയന്ത്രിക്കാൻ','Keep blood pressure in check',
     '<h2>നിയന്ത്രണം</h2><p>ഉപ്പ് കുറയ്ക്കുക, വ്യായാമം ചെയ്യുക, മരുന്ന് ക്രമമായി കഴിക്കുക.</p><h2>നിരീക്ഷണം</h2><p>വീട്ടിൽ ക്രമമായി അളക്കുക.</p>',
     '<h2>Control</h2><p>Reduce salt, exercise and take medication regularly.</p><h2>Monitor</h2><p>Measure at home regularly.</p>'),
    ('kidney-health','disease','വൃക്ക ആരോഗ്യം','Kidney Health','വൃക്കകൾ സംരക്ഷിക്കാൻ','Protecting your kidneys',
     '<h2>വൃക്ക ആരോഗ്യം</h2><p>ആവശ്യത്തിന് വെള്ളം, രക്തസമ്മർദ്ദ നിയന്ത്രണം, പഞ്ചസാര നിയന്ത്രണം പ്രധാനം.</p><h2>ഒഴിവാക്കുക</h2><p>അമിതമായ വേദനസംഹാരികൾ ഒഴിവാക്കുക.</p>',
     '<h2>Kidney health</h2><p>Adequate water, blood-pressure and sugar control are important.</p><h2>Avoid</h2><p>Limit unnecessary painkillers.</p>'),
    ('eye-care','disease','നേത്ര പരിചരണം','Eye Care','കണ്ണുകൾ സംരക്ഷിക്കാൻ','Caring for your eyes',
     '<h2>നേത്ര പരിചരണം</h2><p>ക്രമമായ കാഴ്ച പരിശോധന, സ്ക്രീൻ വിശ്രമം, സൂര്യപ്രകാശ സംരക്ഷണം.</p><h2>ശ്രദ്ധിക്കുക</h2><p>പെട്ടെന്നുള്ള കാഴ്ച നഷ്ടത്തിന് ഉടൻ ഡോക്ടറെ കാണുക.</p>',
     '<h2>Eye care</h2><p>Regular eye tests, screen breaks and sun protection help.</p><h2>Note</h2><p>See a doctor urgently for sudden vision loss.</p>')
  ) AS v(slug, cat, tml, ten, eml, een, bml, ben)
 WHERE NOT EXISTS (SELECT 1 FROM content_items c WHERE c.slug = v.slug);

-- ===== C3: backfill body_area on existing symptoms =====
UPDATE symptoms s SET body_area = v.area FROM (VALUES
  ('fever','general'),('chest-pain','chest'),('skin-rash','general'),('child-fever','general'),
  ('headache','head-neck'),('joint-pain','musculoskeletal'),('eye-redness','eyes-ears'),
  ('toothache','head-neck'),('breathing-difficulty','respiratory'),('anxiety','mental-health')
) AS v(slug, area) WHERE s.slug = v.slug AND s.body_area IS NULL;

-- ===== C3: 20 new symptoms =====
INSERT INTO symptoms (slug, name_ml, name_en, icon_name, body_area)
SELECT v.slug, v.ml, v.en, 'symptom', v.area FROM (VALUES
  ('sore-throat','തൊണ്ടവേദന','Sore Throat','head-neck'),
  ('dizziness','തലകറക്കം','Dizziness','head-neck'),
  ('neck-pain','കഴുത്ത് വേദന','Neck Pain','head-neck'),
  ('palpitations','ഹൃദയമിടിപ്പ് വർധന','Palpitations','chest'),
  ('chest-tightness','നെഞ്ച് മുറുക്കം','Chest Tightness','chest'),
  ('cough','ചുമ','Cough','respiratory'),
  ('shortness-of-breath','ശ്വാസതടസ്സം','Shortness of Breath','respiratory'),
  ('wheezing','ശ്വാസത്തിൽ വിസിൽ','Wheezing','respiratory'),
  ('abdominal-pain','വയറുവേദന','Abdominal Pain','abdomen'),
  ('nausea','ഓക്കാനം','Nausea','abdomen'),
  ('diarrhea','വയറിളക്കം','Diarrhea','abdomen'),
  ('constipation','മലബന്ധം','Constipation','abdomen'),
  ('back-pain','നടുവേദന','Back Pain','musculoskeletal'),
  ('muscle-cramps','പേശിവലിവ്','Muscle Cramps','musculoskeletal'),
  ('blurred-vision','കാഴ്ച മങ്ങൽ','Blurred Vision','eyes-ears'),
  ('ear-pain','ചെവിവേദന','Ear Pain','eyes-ears'),
  ('fatigue','ക്ഷീണം','Fatigue','general'),
  ('fever-with-rash','പനിയും തിണർപ്പും','Fever with Rash','general'),
  ('depression','വിഷാദം','Depression','mental-health'),
  ('insomnia','ഉറക്കമില്ലായ്മ','Insomnia','mental-health')
) AS v(slug, ml, en, area)
 WHERE NOT EXISTS (SELECT 1 FROM symptoms s WHERE s.slug = v.slug);

INSERT INTO symptom_specialties (symptom_id, specialty_id, urgency_level)
SELECT s.id, sp.id, v.urg FROM (VALUES
  ('sore-throat','ent','soon'),('dizziness','neurology','soon'),('neck-pain','orthopedics','routine'),
  ('palpitations','cardiology','urgent'),('chest-tightness','cardiology','urgent'),
  ('cough','general-physician','routine'),('shortness-of-breath','general-physician','emergency'),
  ('wheezing','general-physician','soon'),('abdominal-pain','general-physician','soon'),
  ('nausea','general-physician','routine'),('diarrhea','general-physician','soon'),
  ('constipation','general-physician','routine'),('back-pain','orthopedics','routine'),
  ('muscle-cramps','orthopedics','routine'),('blurred-vision','ophthalmology','soon'),
  ('ear-pain','ent','soon'),('fatigue','general-physician','routine'),
  ('fever-with-rash','general-physician','urgent'),('depression','psychiatry','soon'),
  ('insomnia','psychiatry','routine')
) AS v(sslug, spslug, urg)
JOIN symptoms s ON s.slug = v.sslug
JOIN specialties sp ON sp.slug = v.spslug
ON CONFLICT (symptom_id, specialty_id) DO NOTHING;

SELECT 'articles' AS kind, count(*) FROM content_items WHERE type='article' AND status='published' AND deleted_at IS NULL
UNION ALL SELECT 'symptoms', count(*) FROM symptoms WHERE deleted_at IS NULL;
SQL
echo "seed-prod complete."
