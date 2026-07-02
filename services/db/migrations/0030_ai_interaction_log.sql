-- 0030_ai_interaction_log.sql
-- Audit log for every AI assistant interaction. Additive only.
-- Stores only an input hash (not raw user text) for privacy.

CREATE TABLE IF NOT EXISTS ai_interaction_log (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id      text,
  input_hash      text,
  response_length integer,
  model           varchar(60),
  rag_source_ids  uuid[],
  locale          varchar(5),
  flags           text[],
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ai_log_session ON ai_interaction_log (session_id);
CREATE INDEX IF NOT EXISTS idx_ai_log_created ON ai_interaction_log (created_at);
