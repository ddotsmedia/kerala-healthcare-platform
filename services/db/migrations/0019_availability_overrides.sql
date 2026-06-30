-- 0019_availability_overrides.sql
-- Date-specific availability overrides: block a day, or add extra hours.
-- Additive only.

CREATE TABLE IF NOT EXISTS availability_overrides (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id   uuid NOT NULL REFERENCES doctors(id),
  override_date date NOT NULL,
  is_blocked    boolean NOT NULL DEFAULT false,
  start_time    time,
  end_time      time,
  reason        text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX IF NOT EXISTS idx_avail_ovr_provider ON availability_overrides (provider_id, override_date) WHERE deleted_at IS NULL;
