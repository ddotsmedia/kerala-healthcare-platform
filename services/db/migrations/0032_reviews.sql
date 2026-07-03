-- 0032_reviews.sql
-- Patient reviews & ratings for doctors and hospitals. Additive only.

CREATE TABLE IF NOT EXISTS reviews (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type    varchar(20) NOT NULL,            -- doctor | hospital
  entity_id      uuid NOT NULL,
  patient_id     uuid NOT NULL REFERENCES users(id),
  appointment_id uuid REFERENCES appointments(id),
  rating         integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title          text,
  body           text,
  is_anonymous   boolean DEFAULT false,
  status         varchar(20) DEFAULT 'pending',   -- pending | approved | rejected | flagged
  moderated_by   uuid REFERENCES users(id),
  moderated_at   timestamptz,
  rejection_reason text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz,
  deleted_at     timestamptz,
  UNIQUE (entity_type, entity_id, patient_id)      -- one review per patient per entity
);

CREATE INDEX IF NOT EXISTS idx_reviews_entity ON reviews (entity_type, entity_id)
  WHERE status = 'approved' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_patient ON reviews (patient_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews (status) WHERE deleted_at IS NULL;
