-- 0077_blood_requests.sql
-- P-D3: blood requests + donor matching. Additive only. (Spec labelled this 0087.)

CREATE TABLE IF NOT EXISTS blood_requests (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id  uuid REFERENCES users(id),
  hospital_name text,
  blood_group   varchar(5) NOT NULL
                  CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  units_needed  integer NOT NULL DEFAULT 1,
  district_id   uuid NOT NULL REFERENCES districts(id),
  contact_phone text NOT NULL,
  urgency       varchar(20) NOT NULL DEFAULT 'urgent'
                  CHECK (urgency IN ('urgent','high','normal')),
  is_fulfilled  boolean NOT NULL DEFAULT false,
  expires_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);
CREATE INDEX IF NOT EXISTS idx_blood_requests_active
  ON blood_requests (district_id, blood_group, created_at DESC)
  WHERE is_fulfilled = false AND deleted_at IS NULL;
