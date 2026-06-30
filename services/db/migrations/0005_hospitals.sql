-- 0005_hospitals.sql
-- Hospital directory. Additive only. Never drop columns.
-- Verification MANDATORY before listing_status can become 'published'.

CREATE TABLE IF NOT EXISTS hospitals (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  name_ml            text NOT NULL,
  name_en            text NOT NULL,

  -- Permanent SEO slug: /hospitals/[name]-[district]
  slug               text UNIQUE NOT NULL,

  -- Verification
  registration_no    text,
  verification_status text NOT NULL DEFAULT 'pending'
                       CHECK (verification_status IN ('pending','in_review','verified','rejected')),

  listing_status     text NOT NULL DEFAULT 'draft'
                       CHECK (listing_status IN ('draft','published','unlisted')),
  published_at       timestamptz,

  -- Location
  district_id        uuid REFERENCES districts(id),
  address_ml         text,
  address_en         text,
  latitude           numeric(9,6),
  longitude          numeric(9,6),

  -- Profile
  about_ml           text,
  about_en           text,
  logo_url           text,
  bed_count          integer CHECK (bed_count >= 0),
  emergency_24x7     boolean NOT NULL DEFAULT false,

  -- Sensitive contact — encrypted at column level (app-layer pgcrypto)
  phone_enc          bytea,
  email_enc          bytea,

  -- Search vectors: Malayalam + Manglish
  search_ml          tsvector,
  search_manglish    tsvector,

  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);

-- Guard: hospital may only be 'published' when verified.
CREATE OR REPLACE FUNCTION enforce_hospital_verified_before_publish()
RETURNS trigger AS $$
BEGIN
  IF NEW.listing_status = 'published'
     AND NEW.verification_status <> 'verified' THEN
    RAISE EXCEPTION 'Hospital % cannot be published before verification', NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hospital_publish_guard ON hospitals;
CREATE TRIGGER trg_hospital_publish_guard
  BEFORE INSERT OR UPDATE ON hospitals
  FOR EACH ROW EXECUTE FUNCTION enforce_hospital_verified_before_publish();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_hospitals_district ON hospitals (district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hospitals_listing  ON hospitals (listing_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hospitals_search_ml       ON hospitals USING gin (search_ml);
CREATE INDEX IF NOT EXISTS idx_hospitals_search_manglish ON hospitals USING gin (search_manglish);
CREATE INDEX IF NOT EXISTS idx_hospitals_name_trgm ON hospitals USING gin (name_en gin_trgm_ops);
