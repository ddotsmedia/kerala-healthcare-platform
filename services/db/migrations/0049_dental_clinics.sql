-- 0049_dental_clinics.sql
-- P-A6: Dental clinics directory — new provider type. Additive only.
-- (Spec labelled this 0045; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS dental_clinics (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                  varchar(255) UNIQUE NOT NULL,
  name_ml               text,
  name_en               text NOT NULL,
  address_ml            text,
  address_en            text,
  district_id           uuid REFERENCES districts(id),
  lat                   decimal(10,8),
  lng                   decimal(11,8),
  phone                 text[],
  email                 text,
  website               text,
  registration_number   varchar(100),
  treatments_offered    text[],
  has_digital_xray      boolean NOT NULL DEFAULT false,
  has_rct               boolean NOT NULL DEFAULT false,
  has_implants          boolean NOT NULL DEFAULT false,
  has_orthodontics      boolean NOT NULL DEFAULT false,
  has_pediatric_dental  boolean NOT NULL DEFAULT false,
  sterilisation_standard varchar(100),
  consultation_fee_inr  integer,
  verification_status   varchar(20) NOT NULL DEFAULT 'pending'
                          CHECK (verification_status IN ('pending','verified','rejected')),
  rating_avg            decimal(3,2) NOT NULL DEFAULT 0,
  rating_count          integer NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz
);
CREATE INDEX IF NOT EXISTS idx_dental_district ON dental_clinics (district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dental_verified ON dental_clinics (verification_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dental_treatments ON dental_clinics USING gin (treatments_offered);
