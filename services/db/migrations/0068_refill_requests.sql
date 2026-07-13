-- 0068_refill_requests.sql
-- P-C9: repeat-prescription (refill) requests. Additive only.
-- (Spec labelled this 0079; numbered sequentially per runner.)
-- doctor_id references doctors(id) (the platform provider table).

CREATE TABLE IF NOT EXISTS refill_requests (
  id                       uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id               uuid NOT NULL REFERENCES users(id),
  doctor_id                uuid NOT NULL REFERENCES doctors(id),
  original_prescription_id uuid REFERENCES prescriptions(id),
  medications_requested    jsonb NOT NULL DEFAULT '[]'::jsonb,
  reason                   text,
  urgency                  varchar(20) NOT NULL DEFAULT 'routine'
                             CHECK (urgency IN ('routine','soon','urgent')),
  status                   varchar(20) NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending','approved','rejected','dispatched')),
  doctor_notes             text,
  new_prescription_id      uuid REFERENCES prescriptions(id),
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_refill_patient ON refill_requests (patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_refill_doctor_status ON refill_requests (doctor_id, status, created_at);
