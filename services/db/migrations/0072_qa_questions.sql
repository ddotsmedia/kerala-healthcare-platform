-- 0072_qa_questions.sql
-- P-D1: public patient health questions (moderated). Additive only.
-- (Spec labelled this 0083.)

CREATE TABLE IF NOT EXISTS qa_questions (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         varchar(255) UNIQUE NOT NULL,
  patient_id   uuid NOT NULL REFERENCES users(id),
  title        text NOT NULL,
  body         text NOT NULL,
  specialty_id uuid REFERENCES specialties(id),
  is_anonymous boolean NOT NULL DEFAULT false,
  status       varchar(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending','published','rejected')),
  views        integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);
CREATE INDEX IF NOT EXISTS idx_qa_questions_status ON qa_questions (status, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_qa_questions_specialty ON qa_questions (specialty_id) WHERE deleted_at IS NULL;
