-- Migration 0129: Add prescription columns (additive)
-- The prescriptions table was created in 0061 with PHR-focused schema
-- This migration adds pharmacy-specific columns for Phase 6 medicine marketplace

ALTER TABLE IF EXISTS prescriptions
  ADD COLUMN IF NOT EXISTS patient_id UUID,
  ADD COLUMN IF NOT EXISTS dosage TEXT,
  ADD COLUMN IF NOT EXISTS duration VARCHAR(100),
  ADD COLUMN IF NOT EXISTS issue_date DATE,
  ADD COLUMN IF NOT EXISTS expiry_date DATE,
  ADD COLUMN IF NOT EXISTS refills_left INT DEFAULT 3;

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
