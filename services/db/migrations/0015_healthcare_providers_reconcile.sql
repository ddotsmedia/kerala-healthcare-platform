-- 0015_healthcare_providers_reconcile.sql
-- Reconcile the doctor model with PHASE_1_SPEC's `healthcare_providers` WITHOUT
-- renaming or dropping. Strategy (additive + zero data duplication):
--   1. Add the spec's missing columns to `doctors`.
--   2. Expose `healthcare_providers` as a VIEW over `doctors` with spec column
--      names. The view's id == doctors.id, so existing junction rows already
--      reference the right provider.
--   3. Add a `provider_id` column to the junction tables (= doctor_id), so the
--      spec's provider_specialties(provider_id) shape is satisfied literally.
-- `doctors` remains the physical write table; nurse/physio/etc. provider types
-- extend via the `type` column. See BLOCKERS.md for the full decision.

-- 1. Spec-parity columns on doctors (additive) ------------------------------
ALTER TABLE doctors
  ADD COLUMN IF NOT EXISTS type                 varchar(50) NOT NULL DEFAULT 'doctor',
  ADD COLUMN IF NOT EXISTS user_id              uuid,
  ADD COLUMN IF NOT EXISTS name_ml              text,
  ADD COLUMN IF NOT EXISTS name_en              text,
  ADD COLUMN IF NOT EXISTS bio_ml               text,
  ADD COLUMN IF NOT EXISTS bio_en               text,
  ADD COLUMN IF NOT EXISTS registration_council varchar(100),
  ADD COLUMN IF NOT EXISTS verified_at          timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by          uuid,
  ADD COLUMN IF NOT EXISTS consultation_modes   text[] NOT NULL DEFAULT ARRAY['in_person']::text[];

-- Backfill the new bilingual/name/bio fields from existing data (idempotent).
UPDATE doctors SET
  name_en = COALESCE(name_en, display_name),
  name_ml = COALESCE(name_ml, display_name),
  bio_ml  = COALESCE(bio_ml,  about_ml),
  bio_en  = COALESCE(bio_en,  about_en)
WHERE deleted_at IS NULL;

-- 2. healthcare_providers view (spec-facing canonical name) ------------------
CREATE OR REPLACE VIEW healthcare_providers AS
SELECT
  d.id,
  d.user_id,
  d.slug,
  d.type,
  d.nmc_registration_no            AS registration_number,
  d.registration_council,
  d.verification_status,
  d.verified_at,
  d.verified_by,
  COALESCE(d.name_ml, d.display_name) AS name_ml,
  COALESCE(d.name_en, d.display_name) AS name_en,
  d.photo_url,
  COALESCE(d.bio_ml, d.about_ml)   AS bio_ml,
  COALESCE(d.bio_en, d.about_en)   AS bio_en,
  d.gender,
  d.languages,
  d.years_experience               AS experience_years,
  d.consultation_fee               AS consultation_fee_inr,
  d.consultation_modes,
  d.district_id,
  d.listing_status,
  d.created_at,
  d.updated_at,
  d.deleted_at
FROM doctors d;

-- 3. provider_id on junctions (= doctor_id), additive --------------------------
ALTER TABLE provider_specialties ADD COLUMN IF NOT EXISTS provider_id uuid;
ALTER TABLE provider_education   ADD COLUMN IF NOT EXISTS provider_id uuid;
ALTER TABLE hospital_providers   ADD COLUMN IF NOT EXISTS provider_id uuid;

UPDATE provider_specialties SET provider_id = doctor_id WHERE provider_id IS NULL;
UPDATE provider_education   SET provider_id = doctor_id WHERE provider_id IS NULL;
UPDATE hospital_providers   SET provider_id = doctor_id WHERE provider_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_provspec_provider ON provider_specialties (provider_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_provedu_provider  ON provider_education   (provider_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_hprov_provider    ON hospital_providers   (provider_id) WHERE deleted_at IS NULL;
