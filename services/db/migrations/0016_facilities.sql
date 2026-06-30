-- 0016_facilities.sql
-- Clinic and diagnostic-centre listings. Additive only.
-- Same verification/publish discipline as doctors and hospitals.

CREATE TABLE IF NOT EXISTS facilities (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  kind               varchar(30) NOT NULL CHECK (kind IN ('clinic','diagnostic_centre')),

  name_ml            text,
  name_en            text NOT NULL,
  slug               text UNIQUE NOT NULL,

  district_id        uuid REFERENCES districts(id),
  address_ml         text,
  address_en         text,
  about_ml           text,
  about_en           text,
  phone_enc          bytea,

  verification_status text NOT NULL DEFAULT 'pending'
                       CHECK (verification_status IN ('pending','in_review','verified','rejected')),
  listing_status     text NOT NULL DEFAULT 'draft'
                       CHECK (listing_status IN ('draft','published','unlisted')),
  published_at       timestamptz,

  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);

-- Publish gate: a facility may only be 'published' when verified.
CREATE OR REPLACE FUNCTION enforce_facility_verified_before_publish()
RETURNS trigger AS $$
BEGIN
  IF NEW.listing_status = 'published' AND NEW.verification_status <> 'verified' THEN
    RAISE EXCEPTION 'Facility % cannot be published before verification', NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_facility_publish_guard ON facilities;
CREATE TRIGGER trg_facility_publish_guard
  BEFORE INSERT OR UPDATE ON facilities
  FOR EACH ROW EXECUTE FUNCTION enforce_facility_verified_before_publish();

CREATE INDEX IF NOT EXISTS idx_facilities_kind     ON facilities (kind) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_facilities_district ON facilities (district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_facilities_listing  ON facilities (listing_status) WHERE deleted_at IS NULL;
