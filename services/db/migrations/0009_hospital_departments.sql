-- 0009_hospital_departments.sql
-- Hospital departments (Malayalam-first). Additive only.
-- Department taxonomy only — NOT diagnostic or treatment content.

CREATE TABLE IF NOT EXISTS hospital_departments (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id   uuid NOT NULL REFERENCES hospitals(id),
  name_ml       text NOT NULL,
  name_en       text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_hdept_hospital ON hospital_departments (hospital_id) WHERE deleted_at IS NULL;
