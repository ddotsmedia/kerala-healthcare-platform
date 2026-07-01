-- 0026_symptoms.sql
-- Symptom navigator: symptoms mapped to specialties with an urgency level.
-- Additive. Navigational only — NOT a diagnosis; always redirects to a doctor.

CREATE TABLE IF NOT EXISTS symptoms (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug       text UNIQUE NOT NULL,
  name_ml    text NOT NULL,
  name_en    text NOT NULL,
  icon_name  text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE TABLE IF NOT EXISTS symptom_specialties (
  symptom_id    uuid NOT NULL REFERENCES symptoms(id),
  specialty_id  uuid NOT NULL REFERENCES specialties(id),
  urgency_level varchar(20) NOT NULL DEFAULT 'routine'
                 CHECK (urgency_level IN ('routine','soon','urgent','emergency')),
  PRIMARY KEY (symptom_id, specialty_id)
);
