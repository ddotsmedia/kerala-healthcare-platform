-- 0027_jobs.sql
-- Healthcare Jobs Portal. Additive only.
-- Capability is by profile-row existence (employer_profiles / candidate_profiles)
-- linked to users.id — the users.role enum is not altered. See BLOCKERS.md.

CREATE TABLE IF NOT EXISTS employer_profiles (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid REFERENCES users(id),
  org_name    text NOT NULL,
  org_type    varchar(50),
  district_id uuid REFERENCES districts(id),
  description text,
  website     text,
  logo_url    text,
  verified    boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);
CREATE INDEX IF NOT EXISTS idx_employer_user ON employer_profiles (user_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS job_listings (
  id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug                 varchar(255) UNIQUE NOT NULL,
  employer_id          uuid NOT NULL REFERENCES employer_profiles(id),
  title                text NOT NULL,
  role_category        varchar(100),
  specialty_id         uuid REFERENCES specialties(id),
  description          text,
  requirements         text,
  district_id          uuid REFERENCES districts(id),
  employment_type      varchar(30) CHECK (employment_type IN ('full_time','part_time','contract','locum')),
  experience_years_min integer NOT NULL DEFAULT 0 CHECK (experience_years_min >= 0),
  salary_min           integer,
  salary_max           integer,
  application_deadline date,
  status               varchar(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active','closed','draft')),
  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now(),
  deleted_at           timestamptz
);
CREATE INDEX IF NOT EXISTS idx_job_employer ON job_listings (employer_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_job_status ON job_listings (status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_job_district ON job_listings (district_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS candidate_profiles (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         uuid REFERENCES users(id),
  slug            varchar(255) UNIQUE NOT NULL,
  role_category   varchar(100),
  specialty_id    uuid REFERENCES specialties(id),
  experience_years integer DEFAULT 0,
  district_id     uuid REFERENCES districts(id),
  headline        text,
  summary         text,
  resume_url      text,
  linkedin_url    text,
  is_open_to_work boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);
CREATE INDEX IF NOT EXISTS idx_candidate_user ON candidate_profiles (user_id) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS candidate_education (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id  uuid NOT NULL REFERENCES candidate_profiles(id),
  degree        text,
  institution   text,
  year          integer,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE TABLE IF NOT EXISTS candidate_experience (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id  uuid NOT NULL REFERENCES candidate_profiles(id),
  employer      text,
  role          text,
  from_year     integer,
  to_year       integer,
  created_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);

CREATE TABLE IF NOT EXISTS job_applications (
  id                uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id            uuid NOT NULL REFERENCES job_listings(id),
  candidate_id      uuid NOT NULL REFERENCES candidate_profiles(id),
  cover_letter      text,
  status            varchar(30) NOT NULL DEFAULT 'applied'
                     CHECK (status IN ('applied','shortlisted','interview','offered','rejected','withdrawn')),
  status_changed_at timestamptz,
  employer_notes    text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_application UNIQUE (job_id, candidate_id)
);
CREATE INDEX IF NOT EXISTS idx_app_job ON job_applications (job_id);
CREATE INDEX IF NOT EXISTS idx_app_candidate ON job_applications (candidate_id);
