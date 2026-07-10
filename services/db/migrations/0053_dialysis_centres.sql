-- 0053_dialysis_centres.sql
-- P-A10: Dialysis centres directory — new provider type. Additive only.
-- (Spec labelled this 0049; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS dialysis_centres (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                varchar(255) UNIQUE NOT NULL,
  name_ml             text,
  name_en             text NOT NULL,
  hospital_id         uuid REFERENCES hospitals(id),
  address_ml          text,
  address_en          text,
  district_id         uuid REFERENCES districts(id),
  lat                 decimal(10,8),
  lng                 decimal(11,8),
  phone               text[],
  email               text,
  machine_count       integer,
  sessions_per_week   integer,
  shift_timings       jsonb,
  has_hd              boolean NOT NULL DEFAULT true,
  has_pd              boolean NOT NULL DEFAULT false,
  has_hdf             boolean NOT NULL DEFAULT false,
  accepts_govt_scheme boolean NOT NULL DEFAULT false,
  fee_per_session_inr integer,
  verification_status varchar(20) NOT NULL DEFAULT 'pending'
                        CHECK (verification_status IN ('pending','verified','rejected')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);
CREATE INDEX IF NOT EXISTS idx_dialysis_district ON dialysis_centres (district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dialysis_govt ON dialysis_centres (accepts_govt_scheme) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_dialysis_verified ON dialysis_centres (verification_status) WHERE deleted_at IS NULL;
