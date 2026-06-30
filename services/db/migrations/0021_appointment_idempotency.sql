-- 0021_appointment_idempotency.sql
-- Idempotency key for booking (X-Idempotency-Key). Additive only.

ALTER TABLE appointments ADD COLUMN IF NOT EXISTS idempotency_key varchar(80);

CREATE UNIQUE INDEX IF NOT EXISTS uq_appt_idempotency
  ON appointments (idempotency_key) WHERE idempotency_key IS NOT NULL;
