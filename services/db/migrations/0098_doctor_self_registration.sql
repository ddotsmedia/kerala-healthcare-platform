-- 0098_doctor_self_registration.sql
-- Doctor self-registration fields on the doctors table (the real provider table;
-- the spec's "healthcare_providers" maps to doctors here). Additive only.

ALTER TABLE doctors ADD COLUMN IF NOT EXISTS self_registered boolean DEFAULT false;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS registration_documents jsonb[];
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS registration_ip inet;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS last_profile_update timestamptz;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS registration_council text;
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS registration_payload jsonb;
