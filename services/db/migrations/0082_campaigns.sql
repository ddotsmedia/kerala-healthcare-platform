-- 0082_campaigns.sql
-- Seasonal health awareness campaigns. Additive only.
-- Dates are month/day recurring in spirit; the banner gates on start/end_date.

CREATE TABLE IF NOT EXISTS campaigns (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug           varchar(255) UNIQUE NOT NULL,
  title_ml       text,
  title_en       text NOT NULL,
  description_ml text,
  description_en text,
  theme_color    varchar(7),                  -- hex, campaign branding
  start_date     date,
  end_date       date,
  hero_image_url text,
  content_ml     text,
  content_en     text,
  is_active      boolean DEFAULT false,
  specialty_id   uuid REFERENCES specialties(id),
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz,
  deleted_at     timestamptz
);
CREATE INDEX IF NOT EXISTS idx_campaigns_active ON campaigns (is_active, start_date, end_date) WHERE deleted_at IS NULL;

INSERT INTO campaigns (slug, title_ml, title_en, description_ml, description_en, theme_color, start_date, end_date, content_ml, content_en, is_active, specialty_id) VALUES
  ('world-diabetes-day',
   'ലോക പ്രമേഹ ദിനം', 'World Diabetes Day',
   'പ്രമേഹം നേരത്തെ തിരിച്ചറിയാം — പതിവ് പരിശോധനയിലൂടെ.',
   'Know your numbers — early detection makes a difference.',
   '#0066B3', DATE '2026-11-07', DATE '2026-11-21',
   '<p>പ്രമേഹം കേരളത്തിൽ വ്യാപകമാണ്. പതിവായ രക്തപരിശോധന, സമീകൃത ആഹാരം, വ്യായാമം എന്നിവ പ്രധാനമാണ്.</p><p>ലക്ഷണങ്ങൾ: അമിത ദാഹം, ഇടയ്ക്കിടെ മൂത്രമൊഴിക്കൽ, ക്ഷീണം, മുറിവുകൾ ഉണങ്ങാൻ വൈകൽ.</p><p>ഈ വിവരങ്ങൾ പൊതുവിജ്ഞാനത്തിന് മാത്രം. പരിശോധനയ്ക്കും ഉപദേശത്തിനും ഡോക്ടറെ സമീപിക്കുക.</p>',
   '<p>Diabetes is common across Kerala. Regular blood sugar checks, balanced meals and daily activity all matter.</p><p>Common signs: excessive thirst, frequent urination, tiredness, slow-healing wounds.</p><p>This information is general awareness only. Speak to a qualified doctor for testing and advice.</p>',
   true, (SELECT id FROM specialties WHERE slug = 'general-physician')),

  ('world-heart-day',
   'ലോക ഹൃദയ ദിനം', 'World Heart Day',
   'ഹൃദയാരോഗ്യം കാത്തുസൂക്ഷിക്കാം.',
   'Small habits protect your heart.',
   '#D32F2F', DATE '2026-09-22', DATE '2026-10-06',
   '<p>രക്തസമ്മർദ്ദവും കൊളസ്ട്രോളും പതിവായി പരിശോധിക്കുക. പുകവലി ഒഴിവാക്കുക, ദിവസവും നടക്കുക.</p><p>അടിയന്തര ലക്ഷണങ്ങൾ — നെഞ്ചുവേദന, ശ്വാസതടസ്സം: ഉടൻ 108 വിളിക്കുക.</p><p>ഈ വിവരങ്ങൾ പൊതുവിജ്ഞാനത്തിന് മാത്രം. ഡോക്ടറെ സമീപിക്കുക.</p>',
   '<p>Check blood pressure and cholesterol regularly. Avoid tobacco, and walk daily.</p><p>Emergency signs — chest pain or breathlessness: call 108 immediately.</p><p>This information is general awareness only. Please consult a qualified doctor.</p>',
   false, (SELECT id FROM specialties WHERE slug = 'cardiology')),

  ('world-cancer-day',
   'ലോക കാൻസർ ദിനം', 'World Cancer Day',
   'നേരത്തെയുള്ള കണ്ടെത്തൽ ജീവൻ രക്ഷിക്കും.',
   'Early detection saves lives.',
   '#6A1B9A', DATE '2027-01-28', DATE '2027-02-11',
   '<p>നേരത്തെയുള്ള സ്ക്രീനിംഗ് ചികിത്സാ സാധ്യതകൾ വർധിപ്പിക്കുന്നു. ശരീരത്തിലെ അസാധാരണ മാറ്റങ്ങൾ അവഗണിക്കരുത്.</p><p>ഈ വിവരങ്ങൾ പൊതുവിജ്ഞാനത്തിന് മാത്രം — രോഗനിർണയമല്ല. ഡോക്ടറെ സമീപിക്കുക.</p>',
   '<p>Screening improves treatment options. Do not ignore unusual or persistent changes in your body.</p><p>This information is general awareness only and is not a diagnosis. Please consult a qualified doctor.</p>',
   false, (SELECT id FROM specialties WHERE slug = 'general-surgery')),

  ('world-mental-health-day',
   'ലോക മാനസികാരോഗ്യ ദിനം', 'World Mental Health Day',
   'മാനസികാരോഗ്യവും ആരോഗ്യമാണ്.',
   'Mental health is health.',
   '#00897B', DATE '2026-10-03', DATE '2026-10-17',
   '<p>സമ്മർദ്ദം, ഉത്കണ്ഠ, വിഷാദം — ഇവ ചികിത്സിക്കാവുന്നതാണ്. സഹായം തേടുന്നത് ബലഹീനതയല്ല.</p><p>പ്രതിസന്ധിയിലാണെങ്കിൽ ഉടൻ 112 വിളിക്കുക അല്ലെങ്കിൽ അടുത്തുള്ള ആശുപത്രിയിൽ എത്തുക.</p><p>ഈ വിവരങ്ങൾ പൊതുവിജ്ഞാനത്തിന് മാത്രം. ഡോക്ടറെ സമീപിക്കുക.</p>',
   '<p>Stress, anxiety and depression are treatable. Asking for help is not weakness.</p><p>If you are in crisis, call 112 or go to your nearest hospital immediately.</p><p>This information is general awareness only. Please consult a qualified professional.</p>',
   false, (SELECT id FROM specialties WHERE slug = 'psychiatry')),

  ('kerala-health-week',
   'കേരള ആരോഗ്യ വാരം', 'Kerala Health Week',
   'സംസ്ഥാനവ്യാപക ആരോഗ്യ അവബോധ വാരം.',
   'A statewide week of health awareness.',
   '#2E7D32', DATE '2026-12-01', DATE '2026-12-08',
   '<p>സൗജന്യ പരിശോധനാ ക്യാമ്പുകൾ, അവബോധ പരിപാടികൾ, പ്രതിരോധ കുത്തിവയ്പ്പ് — ജില്ലകളിലുടനീളം.</p><p>ഈ വിവരങ്ങൾ പൊതുവിജ്ഞാനത്തിന് മാത്രം. ഡോക്ടറെ സമീപിക്കുക.</p>',
   '<p>Screening camps, awareness sessions and immunisation drives across all districts.</p><p>This information is general awareness only. Please consult a qualified doctor.</p>',
   false, (SELECT id FROM specialties WHERE slug = 'general-physician'))
ON CONFLICT (slug) DO NOTHING;
