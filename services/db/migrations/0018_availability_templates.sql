-- 0018_availability_templates.sql
-- Weekly recurring availability for a provider. Additive only.
-- provider_id references doctors(id) (healthcare_providers is a view; view ids
-- equal doctors ids).

CREATE TABLE IF NOT EXISTS availability_templates (
  id                    uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id           uuid NOT NULL REFERENCES doctors(id),
  day_of_week           smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time            time NOT NULL,
  end_time              time NOT NULL,
  slot_duration_minutes integer NOT NULL DEFAULT 30 CHECK (slot_duration_minutes > 0),
  consultation_mode     varchar(20) NOT NULL DEFAULT 'in_person'
                          CHECK (consultation_mode IN ('in_person','video','phone')),
  is_active             boolean NOT NULL DEFAULT true,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  deleted_at            timestamptz,
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS idx_avail_tmpl_provider ON availability_templates (provider_id, day_of_week) WHERE deleted_at IS NULL;
