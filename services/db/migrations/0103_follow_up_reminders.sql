-- Doctor-set follow-up reminders for a patient. Additive only.

CREATE TABLE IF NOT EXISTS follow_up_reminders (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id  uuid NOT NULL REFERENCES doctors(id),
  patient_id   uuid NOT NULL REFERENCES users(id),
  due_date     date NOT NULL,
  reason       text,
  status       varchar(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','sent','completed','dismissed')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz,
  deleted_at   timestamptz
);

CREATE INDEX IF NOT EXISTS idx_follow_ups_provider_due
  ON follow_up_reminders (provider_id, due_date) WHERE deleted_at IS NULL AND status IN ('pending','sent');
