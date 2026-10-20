-- Batch 22: Gigs and Shifts staffing tables (additive)

CREATE TABLE IF NOT EXISTS gigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  title TEXT NOT NULL,
  description TEXT,
  specialty TEXT,
  location TEXT NOT NULL,
  city TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  hourly_rate NUMERIC(10,2),
  shift_type TEXT CHECK (shift_type IN ('day', 'night', 'flexible')),
  status TEXT CHECK (status IN ('open', 'filled', 'closed', 'cancelled')) DEFAULT 'open',
  required_qualifications TEXT[],
  experience_required INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS gig_bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gig_id UUID NOT NULL REFERENCES gigs(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(gig_id, doctor_id)
);

CREATE TABLE IF NOT EXISTS shift_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID NOT NULL REFERENCES hospitals(id),
  specialty TEXT NOT NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  shift_type TEXT CHECK (shift_type IN ('morning', 'afternoon', 'night')),
  available_slots INT DEFAULT 1,
  filled_slots INT DEFAULT 0,
  hourly_rate NUMERIC(10,2),
  status TEXT CHECK (status IN ('open', 'filled', 'closed')) DEFAULT 'open',
  requirements TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS locum_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_slot_id UUID NOT NULL REFERENCES shift_slots(id),
  doctor_id UUID NOT NULL REFERENCES doctors(id),
  hospital_id UUID NOT NULL REFERENCES hospitals(id),
  status TEXT CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  feedback_rating INT,
  feedback_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(shift_slot_id, doctor_id)
);

CREATE INDEX IF NOT EXISTS idx_gigs_doctor ON gigs(doctor_id);
CREATE INDEX IF NOT EXISTS idx_gigs_city ON gigs(city);
CREATE INDEX IF NOT EXISTS idx_gigs_status ON gigs(status);
CREATE INDEX IF NOT EXISTS idx_gigs_dates ON gigs(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_gig_bookings_gig ON gig_bookings(gig_id);
CREATE INDEX IF NOT EXISTS idx_gig_bookings_doctor ON gig_bookings(doctor_id);
CREATE INDEX IF NOT EXISTS idx_gig_bookings_status ON gig_bookings(status);

CREATE INDEX IF NOT EXISTS idx_shift_slots_hospital ON shift_slots(hospital_id);
CREATE INDEX IF NOT EXISTS idx_shift_slots_date ON shift_slots(shift_date);
CREATE INDEX IF NOT EXISTS idx_shift_slots_status ON shift_slots(status);

CREATE INDEX IF NOT EXISTS idx_locum_assignments_shift ON locum_assignments(shift_slot_id);
CREATE INDEX IF NOT EXISTS idx_locum_assignments_doctor ON locum_assignments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_locum_assignments_hospital ON locum_assignments(hospital_id);
CREATE INDEX IF NOT EXISTS idx_locum_assignments_status ON locum_assignments(status);
