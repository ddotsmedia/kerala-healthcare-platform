-- 0040_job_alerts.sql
-- Job Alerts Engine (P-B2). Email alerts on jobs matching saved criteria.
-- Additive only. (Spec labelled this 0056; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS job_alerts (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES users(id),
  name         text NOT NULL,
  filters      jsonb NOT NULL DEFAULT '{}'::jsonb,
  frequency    varchar(20) NOT NULL DEFAULT 'daily'
                 CHECK (frequency IN ('instant','daily','weekly')),
  is_active    boolean NOT NULL DEFAULT true,
  last_sent_at timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);
CREATE INDEX IF NOT EXISTS idx_job_alerts_user ON job_alerts (user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_job_alerts_active ON job_alerts (is_active, frequency) WHERE deleted_at IS NULL;

-- Per-alert send ledger: enforces the max-5-emails-per-alert-per-day rate limit
-- and records which jobs were already delivered (no repeats in digests).
CREATE TABLE IF NOT EXISTS job_alert_sends (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id   uuid NOT NULL REFERENCES job_alerts(id),
  job_id     uuid REFERENCES job_listings(id),
  channel    varchar(10) NOT NULL DEFAULT 'email',
  status     varchar(20) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_alert_sends_alert ON job_alert_sends (alert_id, created_at);
CREATE INDEX IF NOT EXISTS idx_alert_sends_job ON job_alert_sends (alert_id, job_id);
