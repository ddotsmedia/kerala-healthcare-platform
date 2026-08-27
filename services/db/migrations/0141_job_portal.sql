-- Jobs Table
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recruiter_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  specialty VARCHAR(100),
  description TEXT,
  location VARCHAR(100),
  salary_min INTEGER,
  salary_max INTEGER,
  experience_required INTEGER DEFAULT 0,
  job_type VARCHAR(50), -- permanent, contract, temporary, locum
  shift VARCHAR(50), -- day, night, rotating, flexible
  employment_type VARCHAR(50), -- full_time, part_time, remote, hybrid
  is_featured BOOLEAN DEFAULT false,
  posted_date TIMESTAMP DEFAULT NOW(),
  expiry_date TIMESTAMP,
  views_count INTEGER DEFAULT 0,
  applications_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- active, closed, draft
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  ON CONFLICT DO NOTHING
);

CREATE INDEX idx_jobs_recruiter_id ON jobs(recruiter_id);
CREATE INDEX idx_jobs_specialty ON jobs(specialty);
CREATE INDEX idx_jobs_location ON jobs(location);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_posted_date ON jobs(posted_date DESC);

-- Job Applications
CREATE TABLE IF NOT EXISTS job_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  candidate_id UUID NOT NULL REFERENCES users(id),
  resume_id UUID,
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'applied', -- applied, reviewing, shortlisted, rejected, offer, accepted
  applied_date TIMESTAMP DEFAULT NOW(),
  reviewed_date TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  ON CONFLICT DO NOTHING
);

CREATE INDEX idx_job_applications_job_id ON job_applications(job_id);
CREATE INDEX idx_job_applications_candidate_id ON job_applications(candidate_id);
CREATE INDEX idx_job_applications_status ON job_applications(status);

-- Saved Jobs
CREATE TABLE IF NOT EXISTS saved_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  saved_date TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, job_id),
  ON CONFLICT DO NOTHING
);

-- Recruiter Accounts
CREATE TABLE IF NOT EXISTS recruiter_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  company_name VARCHAR(255),
  company_logo_url TEXT,
  company_description TEXT,
  industry VARCHAR(100),
  company_size VARCHAR(50),
  website_url TEXT,
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(2,1) DEFAULT 0,
  total_jobs_posted INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ON CONFLICT DO NOTHING
);

-- User Job Preferences
CREATE TABLE IF NOT EXISTS user_job_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  preferred_specialties TEXT[],
  preferred_locations TEXT[],
  min_salary INTEGER,
  max_salary INTEGER,
  preferred_job_types TEXT[],
  preferred_shifts TEXT[],
  experience_level VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ON CONFLICT DO NOTHING
);

-- Job Recommendations
CREATE TABLE IF NOT EXISTS job_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  job_id UUID NOT NULL REFERENCES jobs(id),
  match_percentage INTEGER,
  reason VARCHAR(255),
  recommended_at TIMESTAMP DEFAULT NOW(),
  viewed BOOLEAN DEFAULT false,
  applied BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  ON CONFLICT DO NOTHING
);

CREATE INDEX idx_job_recommendations_user_id ON job_recommendations(user_id);
CREATE INDEX idx_job_recommendations_match_percentage ON job_recommendations(match_percentage DESC);

-- Interview Schedules
CREATE TABLE IF NOT EXISTS interview_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID NOT NULL REFERENCES job_applications(id),
  interview_date TIMESTAMP,
  interview_type VARCHAR(50), -- phone, video, in_person
  jitsi_room_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  notes TEXT,
  interview_feedback TEXT,
  rating INTEGER, -- 1-5
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ON CONFLICT DO NOTHING
);

-- Skill Assessments
CREATE TABLE IF NOT EXISTS skill_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  skill_name VARCHAR(100),
  assessment_type VARCHAR(50), -- mcq, practical, project
  score INTEGER,
  total_score INTEGER,
  certificate_url TEXT,
  issued_date TIMESTAMP,
  expiry_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  ON CONFLICT DO NOTHING
);

-- Job Alerts
CREATE TABLE IF NOT EXISTS job_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  alert_name VARCHAR(100),
  specialty VARCHAR(100),
  location VARCHAR(100),
  min_salary INTEGER,
  max_salary INTEGER,
  job_type VARCHAR(50),
  frequency VARCHAR(50) DEFAULT 'daily', -- daily, weekly, monthly
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ON CONFLICT DO NOTHING
);

-- Direct Messages (Job Portal)
CREATE TABLE IF NOT EXISTS job_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  message_text TEXT,
  is_read BOOLEAN DEFAULT false,
  sent_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  ON CONFLICT DO NOTHING
);

CREATE INDEX idx_job_messages_sender_recipient ON job_messages(sender_id, recipient_id);

-- Career Paths
CREATE TABLE IF NOT EXISTS career_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  specialty VARCHAR(100),
  current_level VARCHAR(50),
  target_level VARCHAR(50),
  years_to_goal INTEGER,
  required_skills TEXT[],
  recommended_jobs TEXT[],
  progress_percentage INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  ON CONFLICT DO NOTHING
);

-- Salary Benchmarks
CREATE TABLE IF NOT EXISTS salary_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialty VARCHAR(100),
  location VARCHAR(100),
  experience_years INTEGER,
  job_type VARCHAR(50),
  average_salary INTEGER,
  p25_salary INTEGER,
  p75_salary INTEGER,
  p90_salary INTEGER,
  updated_at TIMESTAMP DEFAULT NOW(),
  ON CONFLICT DO NOTHING
);

CREATE INDEX idx_salary_benchmarks_specialty_location ON salary_benchmarks(specialty, location);
