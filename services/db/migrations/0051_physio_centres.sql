-- 0051_physio_centres.sql
-- P-A8: Physiotherapy centres directory — new provider type. Additive only.
-- (Spec labelled this 0047; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS physio_centres (
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
  specialisations       text[],
  equipment             text[],
  has_home_visit        boolean NOT NULL DEFAULT false,
  home_visit_districts  text[],
  consultation_fee_inr  integer,
  session_fee_inr       integer,
  verification_status   varchar(20) NOT NULL DEFAULT 'pending'
                          CHECK (verification_status IN ('pending','verified','rejected')),
  rating_avg            decimal(3,2) NOT NULL DEFAULT 0,
  rating_count          integer NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz
);
CREATE INDEX IF NOT EXISTS idx_physio_district ON physio_centres (district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_physio_verified ON physio_centres (verification_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_physio_home ON physio_centres (has_home_visit) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_physio_specialisations ON physio_centres USING gin (specialisations);
