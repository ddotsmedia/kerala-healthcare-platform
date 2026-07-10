-- 0052_mental_health_centres.sql
-- P-A9: Mental health / psychiatry / de-addiction / rehab directory.
-- Additive only. (Spec labelled this 0048; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS mental_health_centres (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                varchar(255) UNIQUE NOT NULL,
  name_ml             text,
  name_en             text NOT NULL,
  type                varchar(50),
  address_ml          text,
  address_en          text,
  district_id         uuid REFERENCES districts(id),
  lat                 decimal(10,8),
  lng                 decimal(11,8),
  phone               text[],
  emergency_phone     text,
  email               text,
  website             text,
  services            text[],
  has_inpatient       boolean NOT NULL DEFAULT false,
  inpatient_beds      integer,
  has_emergency       boolean NOT NULL DEFAULT false,
  is_govt_approved    boolean NOT NULL DEFAULT false,
  consultation_fee_inr integer,
  verification_status varchar(20) NOT NULL DEFAULT 'pending'
                        CHECK (verification_status IN ('pending','verified','rejected')),
  rating_avg          decimal(3,2) NOT NULL DEFAULT 0,
  rating_count        integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);
CREATE INDEX IF NOT EXISTS idx_mhc_district ON mental_health_centres (district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mhc_type ON mental_health_centres (type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mhc_verified ON mental_health_centres (verification_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mhc_services ON mental_health_centres USING gin (services);
