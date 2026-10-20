-- Batch 23: Telemedicine, Appointments, and Patient Health Portal
-- All additive changes to existing patients/doctors/hospitals tables

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  hospital_id UUID REFERENCES hospitals(id),
  starts_at TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN ('booked','confirmed','completed','cancelled','no_show')) DEFAULT 'booked',
  mode TEXT CHECK (mode IN ('in_person','video')) NOT NULL DEFAULT 'in_person',
  fee NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS consultation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id),
  room_name TEXT,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  notes TEXT,
  recording_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS health_vitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  bp_systolic INT,
  bp_diastolic INT,
  pulse INT,
  weight_kg NUMERIC(5,2),
  glucose_mgdl INT,
  temp_c NUMERIC(4,1),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS lab_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  test_name TEXT NOT NULL,
  value TEXT,
  unit TEXT,
  collected_on DATE NOT NULL,
  file_url TEXT,
  status TEXT CHECK (status IN ('pending','normal','abnormal','critical')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  medicine TEXT NOT NULL,
  dosage TEXT,
  instructions TEXT,
  refills_left INT DEFAULT 0,
  issued_on DATE NOT NULL,
  expires_on DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  due_on DATE NOT NULL,
  status TEXT CHECK (status IN ('pending','completed','cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS health_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  goal TEXT NOT NULL,
  target NUMERIC(10,2),
  unit TEXT,
  due_on DATE NOT NULL,
  status TEXT CHECK (status IN ('pending','in_progress','completed','abandoned')) DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS appointment_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID NOT NULL REFERENCES appointments(id),
  remind_at TIMESTAMPTZ NOT NULL,
  channel TEXT CHECK (channel IN ('sms','email','push')) DEFAULT 'sms',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Seed data: patient user (00000000-0000-0000-0000-000000000001) with sample health records
INSERT INTO health_vitals (patient_id, recorded_at, bp_systolic, bp_diastolic, pulse, weight_kg, glucose_mgdl, temp_c)
VALUES
  ('00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '7 days', 120, 80, 72, 70.5, 95, 37.2),
  ('00000000-0000-0000-0000-000000000001', NOW() - INTERVAL '3 days', 118, 78, 70, 70.3, 92, 36.8),
  ('00000000-0000-0000-0000-000000000001', NOW(), 115, 75, 68, 70.0, 90, 37.0)
ON CONFLICT DO NOTHING;

INSERT INTO lab_results (patient_id, test_name, value, unit, collected_on, status)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Hemoglobin', '14.5', 'g/dL', NOW()::DATE - INTERVAL '10 days', 'normal'),
  ('00000000-0000-0000-0000-000000000001', 'Blood Sugar', '95', 'mg/dL', NOW()::DATE, 'normal')
ON CONFLICT DO NOTHING;

INSERT INTO prescriptions (patient_id, doctor_id, medicine, dosage, instructions, refills_left, issued_on)
VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Aspirin', '100mg', 'Once daily after breakfast', 3, NOW()::DATE - INTERVAL '5 days')
ON CONFLICT DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_hospital ON appointments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_starts_at ON appointments(starts_at);

CREATE INDEX IF NOT EXISTS idx_consultation_sessions_appointment ON consultation_sessions(appointment_id);

CREATE INDEX IF NOT EXISTS idx_health_vitals_patient ON health_vitals(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_vitals_recorded_at ON health_vitals(recorded_at DESC);

CREATE INDEX IF NOT EXISTS idx_lab_results_patient ON lab_results(patient_id);
CREATE INDEX IF NOT EXISTS idx_lab_results_collected_on ON lab_results(collected_on DESC);
CREATE INDEX IF NOT EXISTS idx_lab_results_status ON lab_results(status);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_issued_on ON prescriptions(issued_on);

CREATE INDEX IF NOT EXISTS idx_follow_ups_appointment ON follow_ups(appointment_id);
CREATE INDEX IF NOT EXISTS idx_follow_ups_due_on ON follow_ups(due_on);
CREATE INDEX IF NOT EXISTS idx_follow_ups_status ON follow_ups(status);

CREATE INDEX IF NOT EXISTS idx_health_goals_patient ON health_goals(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_goals_due_on ON health_goals(due_on);
CREATE INDEX IF NOT EXISTS idx_health_goals_status ON health_goals(status);

CREATE INDEX IF NOT EXISTS idx_appointment_reminders_appointment ON appointment_reminders(appointment_id);
CREATE INDEX IF NOT EXISTS idx_appointment_reminders_remind_at ON appointment_reminders(remind_at);
