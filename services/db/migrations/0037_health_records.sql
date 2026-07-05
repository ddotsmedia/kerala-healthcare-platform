-- 0037_health_records.sql
-- Personal Health Records. Patient-owned. Additive only.

CREATE TABLE IF NOT EXISTS health_records (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES users(id),
  record_type  varchar(50) NOT NULL,
  -- prescription|lab_report|imaging|vaccination|allergy|medication|condition|surgery|note
  title        text NOT NULL,
  description  text,
  record_date  date,
  file_url     text,
  file_name    text,
  file_size_kb integer,
  doctor_name  text,
  hospital_name text,
  is_shared    boolean DEFAULT false,
  tags         text[],
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz,
  deleted_at   timestamptz
);
CREATE INDEX IF NOT EXISTS idx_health_records_user ON health_records (user_id, record_type) WHERE deleted_at IS NULL;
