-- 0076_blood_donors.sql
-- P-D3: blood donor registry. Additive only. (Spec labelled this 0086.)

CREATE TABLE IF NOT EXISTS blood_donors (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id            uuid NOT NULL UNIQUE REFERENCES users(id),
  blood_group        varchar(5) NOT NULL
                       CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  district_id        uuid NOT NULL REFERENCES districts(id),
  last_donation_date date,
  is_available       boolean NOT NULL DEFAULT true,
  notify_by_email    boolean NOT NULL DEFAULT true,
  notify_by_sms      boolean NOT NULL DEFAULT false,
  medical_conditions text,
  last_alerted_at    timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);
CREATE INDEX IF NOT EXISTS idx_blood_donors_match
  ON blood_donors (district_id, blood_group)
  WHERE is_available = true AND deleted_at IS NULL;
