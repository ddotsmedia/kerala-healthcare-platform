-- 0057_opd_schedules.sql
-- P-A15: Doctor OPD timings per hospital. Additive only.
-- (Spec labelled this 0053; numbered sequentially per runner.)
-- provider_id references doctors(id) — the platform's provider table.

CREATE TABLE IF NOT EXISTS opd_schedules (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id       uuid NOT NULL REFERENCES doctors(id),
  hospital_id       uuid NOT NULL REFERENCES hospitals(id),
  day_of_week       integer[] NOT NULL,
  start_time        time NOT NULL,
  end_time          time NOT NULL,
  consultation_type varchar(50) DEFAULT 'outpatient'
                      CHECK (consultation_type IN ('outpatient','ward_rounds','surgery_day')),
  max_tokens        integer,
  notes_ml          text,
  notes_en          text,
  is_active         boolean NOT NULL DEFAULT true,
  effective_from    date,
  effective_to      date,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_opd_hospital ON opd_schedules (hospital_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_opd_provider ON opd_schedules (provider_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_opd_days ON opd_schedules USING gin (day_of_week);
