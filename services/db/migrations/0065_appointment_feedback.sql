-- 0065_appointment_feedback.sql
-- P-C6: post-appointment feedback request tracking. Additive only.
-- (Spec labelled this 0076; numbered sequentially per runner.)

ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS feedback_sent_at      timestamptz,
  ADD COLUMN IF NOT EXISTS feedback_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS feedback_token        varchar(64);

CREATE UNIQUE INDEX IF NOT EXISTS uq_appointments_feedback_token
  ON appointments (feedback_token) WHERE feedback_token IS NOT NULL;
