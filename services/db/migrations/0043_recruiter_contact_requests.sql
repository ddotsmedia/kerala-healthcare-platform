-- 0043_recruiter_contact_requests.sql
-- P-B4: employer→candidate contact requests + candidate-search audit log.
-- Additive only. (Spec labelled contact requests 0059.)

CREATE TABLE IF NOT EXISTS recruiter_contact_requests (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id  uuid NOT NULL REFERENCES employer_profiles(id),
  candidate_id uuid NOT NULL REFERENCES candidate_profiles(id),
  message      text,
  status       varchar(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','accepted','rejected')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_contact_request UNIQUE (employer_id, candidate_id)
);
CREATE INDEX IF NOT EXISTS idx_contact_req_candidate ON recruiter_contact_requests (candidate_id, status);
CREATE INDEX IF NOT EXISTS idx_contact_req_employer ON recruiter_contact_requests (employer_id, status);

-- Audit trail: every candidate search an employer runs (privacy requirement).
CREATE TABLE IF NOT EXISTS candidate_search_log (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  employer_id  uuid REFERENCES employer_profiles(id),
  filters      jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_count integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_candidate_search_employer ON candidate_search_log (employer_id, created_at);
