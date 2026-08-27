CREATE TABLE IF NOT EXISTS hospital_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  registration_number VARCHAR(100) UNIQUE,
  hospital_type VARCHAR(50),
  founded_year INT,
  total_beds INT DEFAULT 0,
  ibu_beds INT DEFAULT 0,
  icu_beds INT DEFAULT 0,
  departments TEXT[],
  specialties TEXT[],
  nabh_accredited BOOLEAN DEFAULT false,
  aaci_accredited BOOLEAN DEFAULT false,
  emergency_phone VARCHAR(20),
  website VARCHAR(255),
  verified BOOLEAN DEFAULT false,
  description TEXT,
  rating FLOAT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_hospital_profiles_user_id ON hospital_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_type ON hospital_profiles(hospital_type);
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_verified ON hospital_profiles(verified);
CREATE INDEX IF NOT EXISTS idx_hospital_profiles_department ON hospital_profiles USING GIN(departments);
