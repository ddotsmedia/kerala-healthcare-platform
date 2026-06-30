-- 0012_hospital_providers.sql
-- Many-to-many: doctors practising at hospitals. Additive only.

CREATE TABLE IF NOT EXISTS hospital_providers (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id   uuid NOT NULL REFERENCES hospitals(id),
  doctor_id     uuid NOT NULL REFERENCES doctors(id),
  department_id uuid REFERENCES hospital_departments(id),
  role          text,                          -- e.g. 'consultant', 'visiting'
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz,
  CONSTRAINT uq_hospital_provider UNIQUE (hospital_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_hprov_hospital ON hospital_providers (hospital_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hprov_doctor   ON hospital_providers (doctor_id)   WHERE deleted_at IS NULL;
