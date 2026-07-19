-- 0078_forum_categories.sql
-- Community forum categories (condition support groups). Additive only.
-- (Spec labelled 0088; numbered sequentially.)

CREATE TABLE IF NOT EXISTS forum_categories (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug           varchar(255) UNIQUE NOT NULL,
  name_ml        text,
  name_en        text NOT NULL,
  description_ml text,
  description_en text,
  icon           text,
  post_count     integer DEFAULT 0,
  member_count   integer DEFAULT 0,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz,
  deleted_at     timestamptz
);

INSERT INTO forum_categories (slug, name_ml, name_en, description_ml, description_en, icon) VALUES
  ('diabetes', 'പ്രമേഹം', 'Diabetes', 'പ്രമേഹ പിന്തുണാ ഗ്രൂപ്പ്', 'Diabetes peer support', '🩸'),
  ('heart-health', 'ഹൃദയാരോഗ്യം', 'Heart Health', 'ഹൃദ്രോഗ പിന്തുണ', 'Heart disease support', '❤️'),
  ('cancer-support', 'കാൻസർ പിന്തുണ', 'Cancer Support', 'കാൻസർ പിന്തുണാ ഗ്രൂപ്പ്', 'Cancer support group', '🎗️'),
  ('mental-health', 'മാനസികാരോഗ്യം', 'Mental Health', 'മാനസികാരോഗ്യ പിന്തുണ', 'Mental health support', '🧠'),
  ('pregnancy', 'ഗർഭകാലം', 'Pregnancy', 'ഗർഭകാല പിന്തുണ', 'Pregnancy support', '🤰'),
  ('child-health', 'ശിശു ആരോഗ്യം', 'Child Health', 'ശിശു ആരോഗ്യ പിന്തുണ', 'Child health support', '👶'),
  ('general-health', 'പൊതു ആരോഗ്യം', 'General Health', 'പൊതു ആരോഗ്യ ചർച്ച', 'General health discussion', '🩺')
ON CONFLICT (slug) DO NOTHING;
