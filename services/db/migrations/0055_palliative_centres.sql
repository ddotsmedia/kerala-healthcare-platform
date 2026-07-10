-- 0055_palliative_centres.sql
-- P-A12: Palliative care / hospice / home-care directory. Additive only.
-- (Spec labelled this 0051; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS palliative_centres (
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
  email               text,
  coverage_districts  text[],
  has_home_visits     boolean NOT NULL DEFAULT false,
  has_inpatient       boolean NOT NULL DEFAULT false,
  inpatient_beds      integer,
  services            text[],
  is_free_of_cost     boolean NOT NULL DEFAULT false,
  accepts_donations   boolean NOT NULL DEFAULT false,
  verification_status varchar(20) NOT NULL DEFAULT 'pending'
                        CHECK (verification_status IN ('pending','verified','rejected')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);
CREATE INDEX IF NOT EXISTS idx_palliative_district ON palliative_centres (district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_palliative_type ON palliative_centres (type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_palliative_home ON palliative_centres (has_home_visits) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_palliative_verified ON palliative_centres (verification_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_palliative_services ON palliative_centres USING gin (services);
