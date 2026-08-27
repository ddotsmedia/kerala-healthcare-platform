CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES users(id),
  patient_id UUID NOT NULL REFERENCES users(id),
  medications JSONB NOT NULL,
  dosage TEXT,
  duration VARCHAR(100),
  issue_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  refills_left INT DEFAULT 3,
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
