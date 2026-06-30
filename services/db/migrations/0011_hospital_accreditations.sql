-- 0011_hospital_accreditations.sql
-- Hospital accreditations (NABH, NABL, ISO, etc.). Additive only.
-- Supports trust/verification signals on hospital profiles.

CREATE TABLE IF NOT EXISTS hospital_accreditations (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id       uuid NOT NULL REFERENCES hospitals(id),
  body              text NOT NULL,             -- e.g. 'NABH', 'NABL', 'ISO'
  accreditation_no  text,
  valid_until       date,
  verified          boolean NOT NULL DEFAULT false,
  evidence_ref      text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);

CREATE INDEX IF NOT EXISTS idx_haccr_hospital ON hospital_accreditations (hospital_id) WHERE deleted_at IS NULL;
