-- 0050_eye_centres.sql
-- P-A7: Eye centres directory (ophthalmology) — new provider type. Additive only.
-- (Spec labelled this 0046; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS eye_centres (
  id                          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                        varchar(255) UNIQUE NOT NULL,
  name_ml                     text,
  name_en                     text NOT NULL,
  type                        varchar(50),
  address_ml                  text,
  address_en                  text,
  district_id                 uuid REFERENCES districts(id),
  lat                         decimal(10,8),
  lng                         decimal(11,8),
  phone                       text[],
  email                       text,
  website                     text,
  surgeries_offered           text[],
  equipment                   text[],
  has_optical_shop            boolean NOT NULL DEFAULT false,
  has_low_vision_clinic       boolean NOT NULL DEFAULT false,
  has_pediatric_ophthalmology boolean NOT NULL DEFAULT false,
  consultation_fee_inr        integer,
  verification_status         varchar(20) NOT NULL DEFAULT 'pending'
                                CHECK (verification_status IN ('pending','verified','rejected')),
  rating_avg                  decimal(3,2) NOT NULL DEFAULT 0,
  rating_count                integer NOT NULL DEFAULT 0,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now(),
  deleted_at                  timestamptz
);
CREATE INDEX IF NOT EXISTS idx_eye_district ON eye_centres (district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_eye_verified ON eye_centres (verification_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_eye_surgeries ON eye_centres USING gin (surgeries_offered);
