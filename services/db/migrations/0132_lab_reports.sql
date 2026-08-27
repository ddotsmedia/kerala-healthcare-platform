CREATE TABLE IF NOT EXISTS lab_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  test_name VARCHAR(255) NOT NULL,
  lab_name VARCHAR(255) NOT NULL,
  test_date DATE NOT NULL,
  report_file_url TEXT,
  results_json JSONB,
  status VARCHAR(50) DEFAULT 'normal',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_lab_reports_user ON lab_reports(user_id);
