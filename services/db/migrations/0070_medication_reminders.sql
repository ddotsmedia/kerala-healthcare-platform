-- 0070_medication_reminders.sql
-- P-C11: medication reminder schedules + a send ledger (cron dedupe). Additive.
-- (Spec labelled this 0081; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS medication_reminders (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid NOT NULL REFERENCES users(id),
  medication_name text NOT NULL,
  dosage          text,
  reminder_times  time[] NOT NULL DEFAULT '{}',
  days_of_week    integer[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  start_date      date DEFAULT CURRENT_DATE,
  end_date        date,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);
CREATE INDEX IF NOT EXISTS idx_med_reminders_user ON medication_reminders (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_med_reminders_active ON medication_reminders (is_active) WHERE deleted_at IS NULL AND is_active = true;

-- One row per (reminder, date, time) actually sent — prevents duplicate cron sends.
CREATE TABLE IF NOT EXISTS medication_reminder_sends (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reminder_id uuid NOT NULL REFERENCES medication_reminders(id),
  sent_date   date NOT NULL,
  sent_time   time NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_med_reminder_send UNIQUE (reminder_id, sent_date, sent_time)
);
