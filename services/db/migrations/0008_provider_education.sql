-- 0008_provider_education.sql
-- Doctor qualifications / education history. Additive only.

CREATE TABLE IF NOT EXISTS provider_education (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id       uuid NOT NULL REFERENCES doctors(id),
  degree          text NOT NULL,
  institution_ml  text,
  institution_en  text,
  year_completed  integer CHECK (year_completed BETWEEN 1900 AND 2100),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_provedu_doctor ON provider_education (doctor_id) WHERE deleted_at IS NULL;
