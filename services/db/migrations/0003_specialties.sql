-- 0003_specialties.sql
-- Medical specialties reference data. Additive only.
-- NOTE: specialty taxonomy only — NOT diagnostic categories. No clinical logic.

CREATE TABLE IF NOT EXISTS specialties (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        text UNIQUE NOT NULL,
  name_ml     text NOT NULL,
  name_en     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

INSERT INTO specialties (slug, name_ml, name_en) VALUES
  ('general-physician', 'ജനറൽ ഫിസിഷ്യൻ',     'General Physician'),
  ('pediatrics',        'ശിശുരോഗ വിദഗ്ധൻ',    'Pediatrics'),
  ('cardiology',        'ഹൃദ്രോഗ വിദഗ്ധൻ',     'Cardiology'),
  ('dermatology',       'ത്വക്രോഗ വിദഗ്ധൻ',     'Dermatology'),
  ('orthopedics',       'അസ്ഥിരോഗ വിദഗ്ധൻ',   'Orthopedics'),
  ('gynecology',        'ഗൈനക്കോളജി',          'Gynecology'),
  ('ent',               'ഇ.എൻ.ടി',             'ENT'),
  ('ophthalmology',     'നേത്രരോഗ വിദഗ്ധൻ',    'Ophthalmology'),
  ('dentistry',         'ദന്തരോഗ വിദഗ്ധൻ',      'Dentistry'),
  ('psychiatry',        'മനോരോഗ വിദഗ്ധൻ',     'Psychiatry'),
  ('neurology',         'ന്യൂറോളജി',            'Neurology'),
  ('general-surgery',   'ജനറൽ സർജറി',          'General Surgery')
ON CONFLICT (slug) DO NOTHING;
