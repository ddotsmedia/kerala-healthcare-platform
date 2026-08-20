-- P-F6: doctor-issued digital prescriptions. Additive only.

ALTER TABLE prescriptions
  ADD COLUMN IF NOT EXISTS created_by_doctor_id uuid REFERENCES doctors(id),
  ADD COLUMN IF NOT EXISTS is_digital boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS digital_signature text;
