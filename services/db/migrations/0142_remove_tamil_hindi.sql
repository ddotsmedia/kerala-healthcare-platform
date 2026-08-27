-- Migration 0142: Remove Tamil & Hindi Language Support
-- Keep ONLY English (EN) & Malayalam (ML)
-- Date: 2026-08-27
-- Purpose: Simplify language system to 2 languages (EN & ML) for performance & UX

BEGIN;

-- Log the start of migration
INSERT INTO system_logs (action, details, timestamp)
VALUES ('migration_0142_start', 'Beginning removal of Tamil (TA) and Hindi (HI) language support', NOW());

-- Remove Tamil translations (if translations table exists)
DELETE FROM translations WHERE language_code = 'ta';

-- Remove Hindi translations (if translations table exists)
DELETE FROM translations WHERE language_code = 'hi';

-- Update language configuration to reflect EN & ML only
UPDATE system_settings
SET value = jsonb_set(
  COALESCE(value, '{}'::jsonb),
  '{supported_languages}',
  '["en", "ml"]'::jsonb
)
WHERE key = 'app_languages';

-- If the key doesn't exist, insert it
INSERT INTO system_settings (key, value, created_at, updated_at)
VALUES ('app_languages', '{"supported_languages": ["en", "ml"]}'::jsonb, NOW(), NOW())
ON CONFLICT (key) DO NOTHING;

-- Log the completion
INSERT INTO system_logs (action, details, timestamp)
VALUES ('migration_0142_complete', 'Successfully removed Tamil (TA) and Hindi (HI). System now supports English (EN) and Malayalam (ML) only.', NOW());

-- Verify only EN & ML remain in translations table
-- This select is for verification only and won't affect the migration
-- SELECT DISTINCT language_code FROM translations WHERE language_code IN ('en', 'ml', 'ta', 'hi');

COMMIT;
