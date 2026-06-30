-- 0004_doctors.sql
-- Doctor directory. Additive only. Never drop columns.
-- Verification MANDATORY before listing_status can become 'published'.
-- Sensitive fields (mobile, email) stored encrypted at column level (bytea via pgcrypto, app-layer).

CREATE TABLE IF NOT EXISTS doctors (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identity
  first_name         text NOT NULL,
  last_name          text NOT NULL,
  display_name       text NOT NULL,
  gender             text,

  -- Permanent SEO slug: /doctors/dr-[firstname]-[lastname]-[specialty]-[district]
  slug               text UNIQUE NOT NULL,

  -- Registration / verification (NMC registry cross-check)
  nmc_registration_no text NOT NULL,
  nmc_verified        boolean NOT NULL DEFAULT false,
  verification_status text NOT NULL DEFAULT 'pending'
                       CHECK (verification_status IN ('pending','in_review','verified','rejected')),

  -- Listing gate: cannot be 'published' unless verified (enforced in app + trigger below)
  listing_status     text NOT NULL DEFAULT 'draft'
                       CHECK (listing_status IN ('draft','published','unlisted')),
  published_at       timestamptz,

  -- Classification
  specialty_id       uuid REFERENCES specialties(id),
  district_id        uuid REFERENCES districts(id),
  languages          text[] NOT NULL DEFAULT ARRAY['ml']::text[],

  -- Profile content (Malayalam-first)
  about_ml           text,
  about_en           text,
  photo_url          text,
  years_experience   integer CHECK (years_experience >= 0),
  consultation_fee   numeric(10,2) CHECK (consultation_fee >= 0),

  -- Sensitive contact — encrypted at column level (app-layer pgcrypto)
  mobile_enc         bytea,
  email_enc          bytea,

  -- Search vectors: Malayalam script + Manglish (Roman transliteration)
  search_ml          tsvector,
  search_manglish    tsvector,

  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);

-- Guard: a doctor may only be 'published' when verified. Defense in depth (app also enforces).
CREATE OR REPLACE FUNCTION enforce_doctor_verified_before_publish()
RETURNS trigger AS $$
BEGIN
  IF NEW.listing_status = 'published'
     AND (NEW.verification_status <> 'verified' OR NEW.nmc_verified = false) THEN
    RAISE EXCEPTION 'Doctor % cannot be published before NMC verification', NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_doctor_publish_guard ON doctors;
CREATE TRIGGER trg_doctor_publish_guard
  BEFORE INSERT OR UPDATE ON doctors
  FOR EACH ROW EXECUTE FUNCTION enforce_doctor_verified_before_publish();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors (specialty_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_doctors_district  ON doctors (district_id)  WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_doctors_listing   ON doctors (listing_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_doctors_search_ml       ON doctors USING gin (search_ml);
CREATE INDEX IF NOT EXISTS idx_doctors_search_manglish ON doctors USING gin (search_manglish);
CREATE INDEX IF NOT EXISTS idx_doctors_name_trgm ON doctors USING gin (display_name gin_trgm_ops);
