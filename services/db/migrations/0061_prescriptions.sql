-- 0061_prescriptions.sql
-- P-C3: Prescription upload & storage in the PHR. Additive only.
-- (Spec labelled this 0072; numbered sequentially per runner.)
-- medications stored as jsonb holding a JSON array (driver-friendly) — see BLOCKERS.
-- doctor_id references doctors(id) (the platform provider table).

CREATE TABLE IF NOT EXISTS prescriptions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES users(id),
  appointment_id  uuid REFERENCES appointments(id),
  doctor_name     text,
  doctor_id       uuid REFERENCES doctors(id),
  hospital_name   text,
  prescribed_date date,
  valid_until     date,
  medications     jsonb NOT NULL DEFAULT '[]'::jsonb,
  file_url        text,
  file_name       text,
  file_type       varchar(20),
  file_size_kb    integer,
  notes           text,
  tags            text[],
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);
CREATE INDEX IF NOT EXISTS idx_prescriptions_user ON prescriptions (user_id) WHERE deleted_at IS NULL;
