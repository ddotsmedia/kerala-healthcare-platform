-- 0046_pharmacies.sql
-- P-A2: Pharmacy directory — new provider type. Additive only.
-- (Spec labelled this 0041; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS pharmacies (
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
  is_24hr             boolean NOT NULL DEFAULT false,
  has_delivery        boolean NOT NULL DEFAULT false,
  delivery_radius_km  integer,
  sells_generic       boolean NOT NULL DEFAULT false,
  has_cold_storage    boolean NOT NULL DEFAULT false,
  operating_hours     jsonb,
  verification_status varchar(20) NOT NULL DEFAULT 'pending'
                        CHECK (verification_status IN ('pending','verified','rejected')),
  rating_avg          decimal(3,2) NOT NULL DEFAULT 0,
  rating_count        integer NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  deleted_at          timestamptz
);
CREATE INDEX IF NOT EXISTS idx_pharm_district ON pharmacies (district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pharm_24hr ON pharmacies (is_24hr) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pharm_delivery ON pharmacies (has_delivery) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pharm_verified ON pharmacies (verification_status) WHERE deleted_at IS NULL;
