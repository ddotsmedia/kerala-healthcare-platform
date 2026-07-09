-- 0048_ambulance_providers.sql
-- P-A4: Ambulance providers directory — new provider type (emergency-first).
-- Additive only. (Spec labelled this 0043; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS ambulance_providers (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                  varchar(255) UNIQUE NOT NULL,
  name_ml               text,
  name_en               text NOT NULL,
  type                  varchar(50),
  phone                 text[] NOT NULL DEFAULT '{}',
  whatsapp_number       varchar(15),
  district_id           uuid REFERENCES districts(id),
  coverage_districts    text[],
  address_ml            text,
  address_en            text,
  is_24hr               boolean NOT NULL DEFAULT true,
  ambulance_types       text[],
  has_oxygen            boolean NOT NULL DEFAULT false,
  has_ventilator        boolean NOT NULL DEFAULT false,
  has_cardiac_monitor   boolean NOT NULL DEFAULT false,
  has_trained_paramedic boolean NOT NULL DEFAULT false,
  base_fare_inr         integer,
  per_km_fare_inr       integer,
  verification_status   varchar(20) NOT NULL DEFAULT 'pending'
                          CHECK (verification_status IN ('pending','verified','rejected')),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz
);
CREATE INDEX IF NOT EXISTS idx_ambulance_district ON ambulance_providers (district_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ambulance_verified ON ambulance_providers (verification_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_ambulance_types ON ambulance_providers USING gin (ambulance_types);
