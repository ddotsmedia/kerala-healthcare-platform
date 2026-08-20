-- Doctor's private clinical notes on a patient. Additive only.

CREATE TABLE IF NOT EXISTS patient_notes (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id    uuid NOT NULL REFERENCES doctors(id),
  patient_id     uuid NOT NULL REFERENCES users(id),
  appointment_id uuid REFERENCES appointments(id),
  note           text NOT NULL,
  note_type      varchar(50) NOT NULL DEFAULT 'clinical'
                   CHECK (note_type IN ('clinical','follow_up','lab_instruction','alert')),
  is_private     boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz,
  deleted_at     timestamptz
);

CREATE INDEX IF NOT EXISTS idx_patient_notes_provider_patient
  ON patient_notes (provider_id, patient_id) WHERE deleted_at IS NULL;
