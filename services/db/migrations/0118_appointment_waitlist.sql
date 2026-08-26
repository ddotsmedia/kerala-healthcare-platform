-- Appointment Waiting List
CREATE TABLE appointment_waitlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  patient_id UUID NOT NULL REFERENCES users(id),
  appointment_date DATE NOT NULL,
  consultation_mode VARCHAR(20) NOT NULL DEFAULT 'in-person',
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'offered', 'confirmed', 'expired')),
  position INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  offered_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  deleted_at TIMESTAMP,
  UNIQUE(doctor_id, patient_id, appointment_date, consultation_mode)
);

CREATE INDEX idx_waitlist_doctor_date ON appointment_waitlists(doctor_id, appointment_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_waitlist_patient_status ON appointment_waitlists(patient_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_waitlist_status_offered ON appointment_waitlists(status, offered_at) WHERE status = 'offered' AND deleted_at IS NULL;
