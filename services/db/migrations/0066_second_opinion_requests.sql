-- 0066_second_opinion_requests.sql
-- P-C7: patient second-opinion requests. Additive only.
-- (Spec labelled this 0077; numbered sequentially per runner.)
-- *_doctor_id reference doctors(id) (the platform provider table).
-- documents stored as jsonb array of attached health-record ids.

CREATE TABLE IF NOT EXISTS second_opinion_requests (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id            uuid NOT NULL REFERENCES users(id),
  requesting_doctor_id  uuid REFERENCES doctors(id),
  condition_description text NOT NULL,
  existing_diagnosis    text,
  existing_treatment    text,
  urgency               varchar(20) NOT NULL DEFAULT 'routine'
                          CHECK (urgency IN ('routine','soon','urgent')),
  preferred_specialty_id uuid REFERENCES specialties(id),
  preferred_district_id uuid REFERENCES districts(id),
  documents             jsonb NOT NULL DEFAULT '[]'::jsonb,
  status                varchar(20) NOT NULL DEFAULT 'open'
                          CHECK (status IN ('open','matched','completed','cancelled')),
  matched_doctor_id     uuid REFERENCES doctors(id),
  appointment_id        uuid REFERENCES appointments(id),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_second_opinion_patient ON second_opinion_requests (patient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_second_opinion_status ON second_opinion_requests (status, created_at);
