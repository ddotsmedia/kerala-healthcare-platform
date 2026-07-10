-- 0062_lab_reports.sql
-- P-C4: Lab report storage + per-parameter trends. Additive only.
-- (Spec labelled this 0073; numbered sequentially per runner.)
-- results is a jsonb object keyed by marker: {"hba1c":{value,unit,normal_min,normal_max}}.
-- file_url holds a base64 data URI for now — migrate to S3/R2 at H3.

CREATE TABLE IF NOT EXISTS lab_reports (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           uuid NOT NULL REFERENCES users(id),
  lab_name          text,
  report_date       date NOT NULL,
  report_type       varchar(100),
  file_url          text,
  file_name         text,
  file_type         varchar(20),
  file_size_kb      integer,
  results           jsonb NOT NULL DEFAULT '{}'::jsonb,
  notes             text,
  ordered_by_doctor text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  deleted_at        timestamptz
);
CREATE INDEX IF NOT EXISTS idx_lab_reports_user ON lab_reports (user_id, report_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_lab_reports_results ON lab_reports USING gin (results);
