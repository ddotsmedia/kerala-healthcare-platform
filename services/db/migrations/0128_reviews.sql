-- Migration 0128: Add doctor_id and hospital_id columns to reviews table (additive)
-- The reviews table was created in 0032 with generic entity_type/entity_id design
-- This migration adds specific doctor_id/hospital_id columns for easier querying

-- Add new columns if they don't exist (additive only, never drop)
ALTER TABLE IF EXISTS reviews
  ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctor_profiles(id),
  ADD COLUMN IF NOT EXISTS hospital_id UUID REFERENCES hospital_profiles(id);

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_reviews_doctor_id ON reviews(doctor_id);
CREATE INDEX IF NOT EXISTS idx_reviews_hospital_id ON reviews(hospital_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);
