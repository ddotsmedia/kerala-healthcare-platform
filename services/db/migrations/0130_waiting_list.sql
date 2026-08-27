CREATE TABLE IF NOT EXISTS appointment_waiting_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES users(id),
  doctor_id UUID NOT NULL REFERENCES users(id),
  preferred_date DATE,
  status VARCHAR(50) DEFAULT 'waiting',
  notification_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_waiting_list_doctor ON appointment_waiting_list(doctor_id);
