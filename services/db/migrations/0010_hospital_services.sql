-- 0010_hospital_services.sql
-- Hospital services / facilities (e.g. pharmacy, lab, ICU). Additive only.
-- Facility listing only — no clinical claims, no treatment recommendations.

CREATE TABLE IF NOT EXISTS hospital_services (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id   uuid NOT NULL REFERENCES hospitals(id),
  name_ml       text NOT NULL,
  name_en       text NOT NULL,
  available_24x7 boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_hsvc_hospital ON hospital_services (hospital_id) WHERE deleted_at IS NULL;
