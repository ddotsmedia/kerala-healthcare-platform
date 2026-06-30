-- 0007_provider_specialties.sql
-- Many-to-many: a doctor may hold multiple specialties. Additive only.
-- Complements doctors.specialty_id (kept as the primary specialty for SEO slug).

CREATE TABLE IF NOT EXISTS provider_specialties (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id     uuid NOT NULL REFERENCES doctors(id),
  specialty_id  uuid NOT NULL REFERENCES specialties(id),
  is_primary    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz,
  CONSTRAINT uq_provider_specialty UNIQUE (doctor_id, specialty_id)
);

CREATE INDEX IF NOT EXISTS idx_provspec_doctor    ON provider_specialties (doctor_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_provspec_specialty ON provider_specialties (specialty_id) WHERE deleted_at IS NULL;
