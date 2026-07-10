-- 0056_home_nursing_agencies.sql
-- P-A13: Home nursing agency directory — new provider type. Additive only.
-- (Spec labelled this 0052; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS home_nursing_agencies (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                  varchar(255) UNIQUE NOT NULL,
  name_ml               text,
  name_en               text NOT NULL,
  address_ml            text,
  address_en            text,
  district_id           uuid REFERENCES districts(id),
  coverage_districts    text[],
  phone                 text[],
  email                 text,
  website               text,
  services              text[],
  nurse_qualification   varchar(100),
  has_male_nurses       boolean NOT NULL DEFAULT false,
  has_female_nurses     boolean NOT NULL DEFAULT true,
  minimum_booking_hours integer NOT NULL DEFAULT 8,
  hourly_rate_inr       integer,
  daily_rate_inr        integer,
  monthly_rate_inr      integer,
  is_registered         boolean NOT NULL DEFAULT false,
  verification_status   varchar(20) NOT NULL DEFAULT 'pending'
                          CHECK (verification_status IN ('pending','verified','rejected')),
  rating_avg            decimal(3,2) NOT NULL DEFAULT 0,
  rating_count          integer NOT NULL DEFAULT 0,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz
);
CREATE INDEX IF NOT EXISTS idx_homenursing_district ON home_nursing_agencies (district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_homenursing_verified ON home_nursing_agencies (verification_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_homenursing_services ON home_nursing_agencies USING gin (services);
