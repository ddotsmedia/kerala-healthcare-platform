-- 0085_doctor_videos.sql
-- Short educational videos from doctors (YouTube embeds — no video hosting).
-- Additive only. FK references doctors(id) (the spec's "healthcare_providers").

CREATE TABLE IF NOT EXISTS doctor_videos (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              varchar(255) UNIQUE NOT NULL,
  doctor_id         uuid REFERENCES doctors(id),
  title_ml          text,
  title_en          text NOT NULL,
  description_ml    text,
  description_en    text,
  youtube_video_id  varchar(20) NOT NULL,
  duration_seconds  integer,
  category          varchar(50),   -- health-tips|condition|nutrition|mental-health|prevention|ayurveda
  specialty_id      uuid REFERENCES specialties(id),
  view_count        integer DEFAULT 0,
  is_published      boolean DEFAULT false,
  published_at      timestamptz,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz,
  deleted_at        timestamptz
);
CREATE INDEX IF NOT EXISTS idx_doctor_videos_pub ON doctor_videos (is_published, published_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_doctor_videos_category ON doctor_videos (category) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_doctor_videos_specialty ON doctor_videos (specialty_id) WHERE deleted_at IS NULL;

-- Demo videos (placeholder YouTube IDs — replace with real doctor content).
-- Each attaches to an existing doctor + that doctor's specialty when available.
INSERT INTO doctor_videos (slug, doctor_id, title_ml, title_en, description_ml, description_en, youtube_video_id, duration_seconds, category, specialty_id, is_published, published_at)
SELECT 'managing-blood-pressure-at-home', d.id,
       'വീട്ടിൽ രക്തസമ്മർദ്ദം നിയന്ത്രിക്കാം', 'Managing Blood Pressure at Home',
       'ജീവിതശൈലി മാറ്റങ്ങളിലൂടെ രക്തസമ്മർദ്ദം നിയന്ത്രിക്കുന്നതിനെക്കുറിച്ചുള്ള ലളിതമായ നുറുങ്ങുകൾ.',
       'Simple lifestyle tips to help keep your blood pressure in check. General awareness only.',
       'ZC0f0Ky-3lY', 180, 'health-tips', d.specialty_id, true, now()
FROM doctors d WHERE d.deleted_at IS NULL ORDER BY d.created_at LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO doctor_videos (slug, doctor_id, title_ml, title_en, description_ml, description_en, youtube_video_id, duration_seconds, category, specialty_id, is_published, published_at)
SELECT 'understanding-diabetes', d.id,
       'പ്രമേഹം മനസ്സിലാക്കാം', 'Understanding Diabetes',
       'പ്രമേഹത്തിന്റെ ലക്ഷണങ്ങളും പ്രതിരോധവും ഒരു ഡോക്ടർ വിശദീകരിക്കുന്നു.',
       'A doctor explains the signs of diabetes and how to reduce your risk.',
       'wZAjVQWbMlE', 240, 'condition', d.specialty_id, true, now()
FROM doctors d WHERE d.deleted_at IS NULL ORDER BY d.created_at OFFSET 1 LIMIT 1
ON CONFLICT (slug) DO NOTHING;

INSERT INTO doctor_videos (slug, doctor_id, title_ml, title_en, description_ml, description_en, youtube_video_id, duration_seconds, category, specialty_id, is_published, published_at)
SELECT 'healthy-eating-basics', d.id,
       'ആരോഗ്യകരമായ ഭക്ഷണ ശീലങ്ങൾ', 'Healthy Eating Basics',
       'ദൈനംദിന ഭക്ഷണത്തിൽ ചെറിയ മാറ്റങ്ങളിലൂടെ ആരോഗ്യം മെച്ചപ്പെടുത്താം.',
       'Small, practical changes to everyday meals that support better health.',
       'fqhYBTg73fw', 200, 'nutrition', d.specialty_id, true, now()
FROM doctors d WHERE d.deleted_at IS NULL ORDER BY d.created_at OFFSET 2 LIMIT 1
ON CONFLICT (slug) DO NOTHING;
