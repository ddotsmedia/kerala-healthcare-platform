-- 0071_doctor_patient_messages.sql
-- P-C12: async doctor↔patient messages, scoped to a completed appointment.
-- Additive only. (Spec labelled this 0082.)

CREATE TABLE IF NOT EXISTS doctor_patient_messages (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id uuid NOT NULL REFERENCES appointments(id),
  sender_id      uuid NOT NULL REFERENCES users(id),
  sender_role    varchar(20) CHECK (sender_role IN ('patient','doctor')),
  message        text NOT NULL,
  is_read        boolean NOT NULL DEFAULT false,
  read_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_appointment ON doctor_patient_messages (appointment_id, created_at);
