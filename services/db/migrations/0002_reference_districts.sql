-- 0002_reference_districts.sql
-- Kerala districts reference data. Additive only.
-- Malayalam-first: name_ml primary, name_en secondary.

CREATE TABLE IF NOT EXISTS districts (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code        text UNIQUE NOT NULL,
  name_ml     text NOT NULL,
  name_en     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

-- 14 Kerala districts. ON CONFLICT DO NOTHING — idempotent, additive.
INSERT INTO districts (code, name_ml, name_en) VALUES
  ('TVM', 'തിരുവനന്തപുരം', 'Thiruvananthapuram'),
  ('KLM', 'കൊല്ലം',        'Kollam'),
  ('PTA', 'പത്തനംതിട്ട',   'Pathanamthitta'),
  ('ALP', 'ആലപ്പുഴ',       'Alappuzha'),
  ('KTM', 'കോട്ടയം',       'Kottayam'),
  ('IDK', 'ഇടുക്കി',        'Idukki'),
  ('EKM', 'എറണാകുളം',     'Ernakulam'),
  ('TSR', 'തൃശൂർ',         'Thrissur'),
  ('PKD', 'പാലക്കാട്',      'Palakkad'),
  ('MLP', 'മലപ്പുറം',       'Malappuram'),
  ('KKD', 'കോഴിക്കോട്',    'Kozhikode'),
  ('WYD', 'വയനാട്',        'Wayanad'),
  ('KNR', 'കണ്ണൂർ',         'Kannur'),
  ('KSD', 'കാസർഗോഡ്',     'Kasaragod')
ON CONFLICT (code) DO NOTHING;
