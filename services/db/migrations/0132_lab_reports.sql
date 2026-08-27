-- Migration 0132: Add lab report columns (additive)
-- The lab_reports table was created in 0062 with PHR-focused schema
-- This migration adds columns for enhanced lab test booking in Phase 6

ALTER TABLE IF EXISTS lab_reports
  ADD COLUMN IF NOT EXISTS test_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS lab_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS test_date DATE,
  ADD COLUMN IF NOT EXISTS report_file_url TEXT,
  ADD COLUMN IF NOT EXISTS results_json JSONB,
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'normal';

CREATE INDEX IF NOT EXISTS idx_lab_reports_user ON lab_reports(user_id);
