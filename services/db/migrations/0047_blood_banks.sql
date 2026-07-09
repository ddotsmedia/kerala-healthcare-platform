-- 0047_blood_banks.sql
-- P-A3: Blood Banks directory — new provider type (emergency-oriented).
-- Additive only. (Spec labelled this 0042; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS blood_banks (
  id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                     varchar(255) UNIQUE NOT NULL,
  name_ml                  text,
  name_en                  text NOT NULL,
  hospital_id              uuid REFERENCES hospitals(id),
  address_ml               text,
  address_en               text,
  district_id              uuid REFERENCES districts(id),
  lat                      decimal(10,8),
  lng                      decimal(11,8),
  phone                    text[] NOT NULL DEFAULT '{}',
  emergency_phone          text,
  email                    text,
  license_number           varchar(100),
  is_24hr                  boolean NOT NULL DEFAULT false,
  blood_types_available    text[],
  has_apheresis            boolean NOT NULL DEFAULT false,
  has_component_separation boolean NOT NULL DEFAULT false,
  operating_hours          jsonb,
  verification_status      varchar(20) NOT NULL DEFAULT 'pending'
                             CHECK (verification_status IN ('pending','verified','rejected')),
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now(),
  deleted_at               timestamptz
);
CREATE INDEX IF NOT EXISTS idx_bloodbanks_district ON blood_banks (district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bloodbanks_24hr ON blood_banks (is_24hr) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bloodbanks_verified ON blood_banks (verification_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bloodbanks_types ON blood_banks USING gin (blood_types_available);
