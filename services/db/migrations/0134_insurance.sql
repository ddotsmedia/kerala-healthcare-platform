CREATE TABLE IF NOT EXISTS user_insurance_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  policy_number VARCHAR(100) UNIQUE,
  provider VARCHAR(255),
  coverage_amount INT,
  deductible INT,
  status VARCHAR(50) DEFAULT 'active',
  expiry_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS insurance_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id),
  user_id UUID NOT NULL REFERENCES users(id),
  claim_amount INT,
  status VARCHAR(50) DEFAULT 'pending',
  submitted_date TIMESTAMP DEFAULT NOW()
);
