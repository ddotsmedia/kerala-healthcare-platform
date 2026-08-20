-- 0097_import_jobs.sql
-- Bulk provider import jobs (admin CSV import). Additive only.

CREATE TABLE IF NOT EXISTS import_jobs (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id  uuid REFERENCES users(id),
  type           varchar(20),   -- doctors|hospitals|labs
  filename       text,
  total_rows     integer,
  processed_rows integer DEFAULT 0,
  success_rows   integer DEFAULT 0,
  error_rows     integer DEFAULT 0,
  status         varchar(20) DEFAULT 'pending',  -- pending|processing|completed|failed
  errors         jsonb[],       -- [{row, field, error_message}]
  preview        jsonb,         -- first rows + parsed columns, for the review step
  raw_csv        text,          -- stored so execute can re-parse
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz,
  deleted_at     timestamptz
);
CREATE INDEX IF NOT EXISTS idx_import_jobs_admin ON import_jobs (admin_user_id, created_at) WHERE deleted_at IS NULL;
