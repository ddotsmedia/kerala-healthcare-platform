-- 0038_allergies_medications.sql
-- Patient allergies + medications (PHR). Additive only.

CREATE TABLE IF NOT EXISTS patient_allergies (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES users(id),
  allergen   text NOT NULL,
  reaction   text,
  severity   varchar(20),   -- mild|moderate|severe|life-threatening
  noted_at   date,
  created_at timestamptz DEFAULT now(),
  deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_allergies_user ON patient_allergies (user_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS patient_medications (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES users(id),
  medication_name text NOT NULL,
  dosage          text,
  frequency       text,
  prescribed_by   text,
  start_date      date,
  end_date        date,
  is_ongoing      boolean DEFAULT false,
  notes           text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz,
  deleted_at      timestamptz
);
CREATE INDEX IF NOT EXISTS idx_medications_user ON patient_medications (user_id) WHERE deleted_at IS NULL;
