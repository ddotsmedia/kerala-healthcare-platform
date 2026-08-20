-- P-F7: doctor's interpretation of a patient's lab report. Additive only.

CREATE TABLE IF NOT EXISTS lab_interpretations (
  id                     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id            uuid NOT NULL REFERENCES doctors(id),
  patient_id             uuid NOT NULL REFERENCES users(id),
  lab_report_id          uuid REFERENCES lab_reports(id),
  appointment_id         uuid REFERENCES appointments(id),
  interpretation         text NOT NULL,
  recommendations        text,
  next_test_date         date,
  urgency                varchar(20) NOT NULL DEFAULT 'routine'
                           CHECK (urgency IN ('routine','soon','urgent')),
  is_shared_with_patient boolean NOT NULL DEFAULT true,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz,
  deleted_at             timestamptz
);

CREATE INDEX IF NOT EXISTS idx_lab_interp_report
  ON lab_interpretations (lab_report_id) WHERE deleted_at IS NULL AND is_shared_with_patient = true;
CREATE INDEX IF NOT EXISTS idx_lab_interp_patient
  ON lab_interpretations (patient_id) WHERE deleted_at IS NULL;
