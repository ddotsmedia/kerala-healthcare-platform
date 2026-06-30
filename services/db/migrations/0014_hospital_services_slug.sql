-- 0014_hospital_services_slug.sql
-- Add the spec service_slug model to hospital_services additively.
-- Keeps existing name_ml/name_en/available_24x7 columns (no drop).

ALTER TABLE hospital_services
  ADD COLUMN IF NOT EXISTS service_slug varchar(50),
  ADD COLUMN IF NOT EXISTS available    boolean NOT NULL DEFAULT true;

-- Constrain service_slug to the known facility catalogue (nullable allowed).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_hospital_service_slug'
  ) THEN
    ALTER TABLE hospital_services
      ADD CONSTRAINT chk_hospital_service_slug CHECK (
        service_slug IS NULL OR service_slug IN
        ('mri','ct','xray','ultrasound','icu','nicu','dialysis','ivf',
         'cath_lab','blood_bank','pharmacy','lab','ambulance','emergency')
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_hsvc_slug ON hospital_services (service_slug) WHERE deleted_at IS NULL;
