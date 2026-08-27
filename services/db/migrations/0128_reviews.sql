CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reviewer_id UUID NOT NULL REFERENCES users(id),
  doctor_id UUID REFERENCES doctor_profiles(id),
  hospital_id UUID REFERENCES hospital_profiles(id),
  rating INT NOT NULL,
  comment TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_doctor_id ON reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_hospital_id ON reviews(hospital_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
