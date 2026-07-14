-- 0074_qa_moderation.sql
-- P-D1: moderation audit fields for Q&A. Additive only.

ALTER TABLE qa_questions ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE qa_questions ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES users(id);
ALTER TABLE qa_questions ADD COLUMN IF NOT EXISTS moderated_at timestamptz;

ALTER TABLE qa_answers ADD COLUMN IF NOT EXISTS rejection_reason text;
ALTER TABLE qa_answers ADD COLUMN IF NOT EXISTS moderated_by uuid REFERENCES users(id);
ALTER TABLE qa_answers ADD COLUMN IF NOT EXISTS moderated_at timestamptz;
