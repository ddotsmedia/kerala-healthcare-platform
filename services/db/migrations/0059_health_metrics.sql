-- 0059_health_metrics.sql
-- P-C1: Daily patient health metrics tracker. Additive only.
-- (Spec labelled this 0070; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS health_metrics (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES users(id),
  metric_type varchar(50) NOT NULL,
  value       decimal(10,2) NOT NULL,
  unit        varchar(20),
  notes       text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_type
  ON health_metrics (user_id, metric_type, recorded_at DESC);
