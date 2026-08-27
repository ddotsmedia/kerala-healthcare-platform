CREATE TABLE IF NOT EXISTS doctor_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nmc_number VARCHAR(50) UNIQUE,
  specialties TEXT[],
  experience INT DEFAULT 0,
  languages TEXT[],
  qualifications JSONB,
  consultation_fee INT DEFAULT 0,
  office_hours JSONB,
  verified BOOLEAN DEFAULT false,
  bio TEXT,
  patient_count INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user_id ON doctor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_specialty ON doctor_profiles USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_verified ON doctor_profiles(verified);
