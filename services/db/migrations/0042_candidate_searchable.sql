-- 0042_candidate_searchable.sql
-- P-B4: recruiter-facing candidate search fields. Additive only.
-- (Spec labelled this 0058; numbered sequentially per runner.)
-- headline/summary already exist from 0027 — IF NOT EXISTS keeps this idempotent.

ALTER TABLE candidate_profiles
  ADD COLUMN IF NOT EXISTS is_searchable        boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS headline             text,
  ADD COLUMN IF NOT EXISTS summary              text,
  ADD COLUMN IF NOT EXISTS current_location     varchar(100),
  ADD COLUMN IF NOT EXISTS preferred_districts  text[],
  ADD COLUMN IF NOT EXISTS preferred_job_types  text[],
  ADD COLUMN IF NOT EXISTS expected_salary_min  integer,
  ADD COLUMN IF NOT EXISTS notice_period_days   integer,
  ADD COLUMN IF NOT EXISTS profile_views        integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active_at        timestamptz;

CREATE INDEX IF NOT EXISTS idx_candidate_searchable
  ON candidate_profiles (is_searchable) WHERE deleted_at IS NULL AND is_searchable = true;
CREATE INDEX IF NOT EXISTS idx_candidate_role ON candidate_profiles (role_category) WHERE deleted_at IS NULL;
