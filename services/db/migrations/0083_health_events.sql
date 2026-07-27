-- 0083_health_events.sql
-- Free health camps, blood drives, vaccination + awareness events. Additive only.

CREATE TABLE IF NOT EXISTS health_events (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                  varchar(255) UNIQUE NOT NULL,
  title_ml              text,
  title_en              text NOT NULL,
  type                  varchar(50),   -- screening_camp|blood_donation|vaccination|awareness|cme|wellness
  organiser             text,
  hospital_id           uuid REFERENCES hospitals(id),
  venue_ml              text,
  venue_en              text,
  district_id           uuid REFERENCES districts(id),
  event_date            date NOT NULL,
  start_time            time,
  end_time              time,
  is_free               boolean DEFAULT true,
  registration_required boolean DEFAULT false,
  registration_url      text,
  contact_phone         text,
  description_ml        text,
  description_en        text,
  max_participants      integer,
  current_registrations integer DEFAULT 0,
  status                varchar(20) DEFAULT 'upcoming',  -- upcoming|ongoing|completed|cancelled
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz,
  deleted_at            timestamptz
);
CREATE INDEX IF NOT EXISTS idx_health_events_date ON health_events (event_date, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_health_events_type ON health_events (type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_health_events_district ON health_events (district_id) WHERE deleted_at IS NULL;

INSERT INTO health_events (slug, title_ml, title_en, type, organiser, venue_ml, venue_en, district_id, event_date, start_time, end_time, is_free, registration_required, contact_phone, description_ml, description_en, max_participants) VALUES
  ('free-diabetes-screening-ernakulam',
   'സൗജന്യ പ്രമേഹ പരിശോധന ക്യാമ്പ്', 'Free Diabetes Screening Camp',
   'screening_camp', 'MalayaliDoctor Community Health',
   'ടൗൺ ഹാൾ, എറണാകുളം', 'Town Hall, Ernakulam',
   (SELECT id FROM districts WHERE name_en = 'Ernakulam' LIMIT 1),
   current_date + 7, TIME '09:00', TIME '13:00', true, false, '+91 484 000 1111',
   'സൗജന്യ രക്തത്തിലെ പഞ്ചസാര പരിശോധനയും ഭക്ഷണ ഉപദേശവും. എല്ലാവർക്കും സ്വാഗതം.',
   'Free blood sugar testing and dietary guidance. Open to all. General awareness only.', 200),

  ('blood-donation-drive-tvm',
   'രക്തദാന ക്യാമ്പ്', 'Blood Donation Drive',
   'blood_donation', 'Kerala Blood Donors Forum',
   'മെഡിക്കൽ കോളേജ്, തിരുവനന്തപുരം', 'Medical College, Thiruvananthapuram',
   (SELECT id FROM districts WHERE name_en = 'Thiruvananthapuram' LIMIT 1),
   current_date + 10, TIME '10:00', TIME '16:00', true, true, '+91 471 000 2222',
   'നിങ്ങളുടെ ഒരു തുള്ളി രക്തം ഒരു ജീവൻ രക്ഷിക്കാം. 18-60 വയസ്സ്, ആരോഗ്യമുള്ളവർ.',
   'One donation can save a life. Ages 18-60, healthy donors welcome.', 300),

  ('covid-flu-vaccination-kozhikode',
   'വാക്സിനേഷൻ ക്യാമ്പ്', 'Flu Vaccination Camp',
   'vaccination', 'District Health Society',
   'കമ്മ്യൂണിറ്റി ഹാൾ, കോഴിക്കോട്', 'Community Hall, Kozhikode',
   (SELECT id FROM districts WHERE name_en = 'Kozhikode' LIMIT 1),
   current_date + 14, TIME '09:30', TIME '15:00', true, true, '+91 495 000 3333',
   'സീസണൽ ഫ്ലൂ വാക്സിൻ. മുതിർന്നവർക്കും കുട്ടികൾക്കും. ഡോക്ടറുടെ ഉപദേശം അനുസരിച്ച്.',
   'Seasonal flu vaccine for adults and children, subject to a doctor''s advice.', 250),

  ('womens-wellness-awareness-thrissur',
   'സ്ത്രീ ആരോഗ്യ അവബോധ പരിപാടി', 'Women''s Wellness Awareness',
   'awareness', 'MalayaliDoctor Women''s Health',
   'ടൗൺ ഹാൾ, തൃശൂർ', 'Town Hall, Thrissur',
   (SELECT id FROM districts WHERE name_en = 'Thrissur' LIMIT 1),
   current_date + 18, TIME '11:00', TIME '14:00', true, false, '+91 487 000 4444',
   'സ്ത്രീകളുടെ ആരോഗ്യം സംബന്ധിച്ച അവബോധ സെഷൻ. വിദഗ്ധരുമായി സംവാദം.',
   'Awareness session on women''s health with an expert Q&A. General awareness only.', 150),

  ('heart-health-cme-kollam',
   'ഹൃദയാരോഗ്യ CME', 'Heart Health CME',
   'cme', 'Kerala Cardiology Association',
   'ഹോട്ടൽ കൺവെൻഷൻ സെന്റർ, കൊല്ലം', 'Hotel Convention Centre, Kollam',
   (SELECT id FROM districts WHERE name_en = 'Kollam' LIMIT 1),
   current_date + 21, TIME '09:00', TIME '17:00', false, true, '+91 474 000 5555',
   'ഡോക്ടർമാർക്കുള്ള തുടർവിദ്യാഭ്യാസ പരിപാടി. രജിസ്ട്രേഷൻ ആവശ്യമാണ്.',
   'Continuing medical education for doctors. Registration required.', 100)
ON CONFLICT (slug) DO NOTHING;
