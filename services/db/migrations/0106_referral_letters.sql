-- P-F8: specialist referral letters between doctors. Additive only.

CREATE TABLE IF NOT EXISTS referral_letters (
  id                     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referring_doctor_id    uuid NOT NULL REFERENCES doctors(id),
  referred_to_doctor_id  uuid NOT NULL REFERENCES doctors(id),
  patient_id             uuid NOT NULL REFERENCES users(id),
  reason                 text NOT NULL,
  clinical_summary       text,
  urgency                varchar(20) NOT NULL DEFAULT 'routine'
                           CHECK (urgency IN ('routine','soon','urgent')),
  appointment_id         uuid REFERENCES appointments(id),
  referred_appointment_id uuid REFERENCES appointments(id),
  status                 varchar(20) NOT NULL DEFAULT 'sent'
                           CHECK (status IN ('sent','acknowledged','completed','declined')),
  outcome                text,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz,
  deleted_at             timestamptz
);

CREATE INDEX IF NOT EXISTS idx_referrals_from ON referral_letters (referring_doctor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_referrals_to ON referral_letters (referred_to_doctor_id) WHERE deleted_at IS NULL;
