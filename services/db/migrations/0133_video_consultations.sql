CREATE TABLE IF NOT EXISTS video_consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID UNIQUE REFERENCES appointments(id),
  doctor_id UUID NOT NULL REFERENCES users(id),
  patient_id UUID NOT NULL REFERENCES users(id),
  jitsi_room_id VARCHAR(255) UNIQUE,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  duration INT,
  recording_url TEXT,
  status VARCHAR(50) DEFAULT 'scheduled',
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_video_consultations_appointment ON video_consultations(appointment_id);
