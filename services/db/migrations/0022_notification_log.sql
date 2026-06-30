-- 0022_notification_log.sql
-- Audit log for every notification attempt. Additive only.

CREATE TABLE IF NOT EXISTS notification_log (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id uuid REFERENCES appointments(id),
  channel        varchar(10) NOT NULL CHECK (channel IN ('sms','email')),
  template       varchar(40),
  recipient      text,
  status         varchar(20) NOT NULL CHECK (status IN ('sent','failed','skipped','simulated')),
  error_message  text,
  sent_at        timestamptz,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notiflog_appointment ON notification_log (appointment_id);
CREATE INDEX IF NOT EXISTS idx_notiflog_status ON notification_log (status);
