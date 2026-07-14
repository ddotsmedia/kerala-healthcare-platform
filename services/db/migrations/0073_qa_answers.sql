-- 0073_qa_answers.sql
-- P-D1: doctor answers to Q&A questions (moderated). Additive only.
-- (Spec labelled this 0084.) doctor_id references doctors(id).

CREATE TABLE IF NOT EXISTS qa_answers (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id   uuid NOT NULL REFERENCES qa_questions(id),
  doctor_id     uuid NOT NULL REFERENCES doctors(id),
  body          text NOT NULL,
  is_accepted   boolean NOT NULL DEFAULT false,
  status        varchar(20) NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','published','rejected')),
  helpful_count integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);
CREATE INDEX IF NOT EXISTS idx_qa_answers_question ON qa_answers (question_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_qa_answers_doctor ON qa_answers (doctor_id, status) WHERE deleted_at IS NULL;
