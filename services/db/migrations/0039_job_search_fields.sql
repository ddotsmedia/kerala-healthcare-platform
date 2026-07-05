-- 0039_job_search_fields.sql
-- Advanced job-search fields. Additive only.
-- (Spec labelled this 0055; numbered sequentially as 0039 per migration runner.)

ALTER TABLE job_listings
  ADD COLUMN IF NOT EXISTS salary_period         varchar(20) DEFAULT 'monthly',  -- monthly|annual|daily|hourly
  ADD COLUMN IF NOT EXISTS experience_years_max  integer,
  ADD COLUMN IF NOT EXISTS is_remote             boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_urgent             boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS job_type              varchar(30) DEFAULT 'full_time', -- full_time|part_time|contract|locum|internship
  ADD COLUMN IF NOT EXISTS qualification_required text[],
  ADD COLUMN IF NOT EXISTS benefits              text[],
  ADD COLUMN IF NOT EXISTS views_count           integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS applications_count    integer DEFAULT 0;

-- Backfill job_type from the existing employment_type for current rows.
UPDATE job_listings SET job_type = employment_type
 WHERE employment_type IS NOT NULL AND (job_type IS NULL OR job_type = 'full_time');

CREATE INDEX IF NOT EXISTS idx_job_type ON job_listings (job_type) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_job_urgent ON job_listings (is_urgent) WHERE deleted_at IS NULL AND is_urgent = true;
