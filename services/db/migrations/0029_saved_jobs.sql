-- 0029_saved_jobs.sql
-- Candidate saved job listings. Additive only.

CREATE TABLE IF NOT EXISTS saved_jobs (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id uuid NOT NULL REFERENCES candidate_profiles(id),
  job_id       uuid NOT NULL REFERENCES job_listings(id),
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_saved_job UNIQUE (candidate_id, job_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_candidate ON saved_jobs (candidate_id);
