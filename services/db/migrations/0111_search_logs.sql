-- P-G2: search query logging for platform improvement. Additive only.

CREATE TABLE IF NOT EXISTS search_logs (
  id                  uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  query               text NOT NULL,
  locale              varchar(5),
  result_count        integer NOT NULL DEFAULT 0,
  filters             jsonb,
  clicked_result_id   uuid,
  clicked_result_type varchar(50),
  session_id          varchar(64),
  searched_at         timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_search_logs_date ON search_logs (searched_at DESC);
CREATE INDEX IF NOT EXISTS idx_search_logs_zero ON search_logs (searched_at DESC) WHERE result_count = 0;
