-- 0020_appointments.sql
-- Appointments with DATABASE-LEVEL double-booking prevention. Additive only.

CREATE TABLE IF NOT EXISTS appointments (
  id                 uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_ref        varchar(12) UNIQUE NOT NULL,
  provider_id        uuid NOT NULL REFERENCES doctors(id),
  patient_id         uuid NOT NULL REFERENCES users(id),
  hospital_id        uuid REFERENCES hospitals(id),

  slot_date          date NOT NULL,
  slot_start         time NOT NULL,
  slot_end           time NOT NULL,
  consultation_mode  varchar(20) NOT NULL DEFAULT 'in_person'
                       CHECK (consultation_mode IN ('in_person','video','phone')),

  status             varchar(20) NOT NULL DEFAULT 'confirmed'
                       CHECK (status IN ('confirmed','cancelled','completed','no_show')),

  consultation_room  varchar(64),               -- video room id (Task 2.7)
  notes_for_doctor   text,
  cancellation_reason text,
  cancelled_at       timestamptz,
  cancelled_by       uuid REFERENCES users(id),

  reminder_24h_sent  boolean NOT NULL DEFAULT false,
  reminder_2h_sent   boolean NOT NULL DEFAULT false,

  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  deleted_at         timestamptz
);

-- Concurrency-safe double-booking prevention: at most one CONFIRMED appointment
-- per provider/date/start-time.
CREATE UNIQUE INDEX IF NOT EXISTS uq_appt_provider_slot_confirmed
  ON appointments (provider_id, slot_date, slot_start)
  WHERE status = 'confirmed';

CREATE INDEX IF NOT EXISTS idx_appt_patient ON appointments (patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appt_provider_date ON appointments (provider_id, slot_date) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_appt_status ON appointments (status) WHERE deleted_at IS NULL;
