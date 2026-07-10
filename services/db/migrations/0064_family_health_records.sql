-- 0064_family_health_records.sql
-- P-C5: link PHR records + appointments to a family member (nullable = self).
-- Additive only. (Spec labelled this 0075.)

ALTER TABLE health_records
  ADD COLUMN IF NOT EXISTS family_member_id uuid REFERENCES family_members(id);
ALTER TABLE prescriptions
  ADD COLUMN IF NOT EXISTS family_member_id uuid REFERENCES family_members(id);
ALTER TABLE lab_reports
  ADD COLUMN IF NOT EXISTS family_member_id uuid REFERENCES family_members(id);
ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS family_member_id uuid REFERENCES family_members(id);

CREATE INDEX IF NOT EXISTS idx_health_records_family ON health_records (family_member_id) WHERE family_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prescriptions_family ON prescriptions (family_member_id) WHERE family_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_lab_reports_family ON lab_reports (family_member_id) WHERE family_member_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_appointments_family ON appointments (family_member_id) WHERE family_member_id IS NOT NULL;
