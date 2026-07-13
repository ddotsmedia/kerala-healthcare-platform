-- 0069_health_goals.sql
-- P-C10: patient health goals. Additive only.
-- (Spec labelled this 0080; numbered sequentially per runner.)

CREATE TABLE IF NOT EXISTS health_goals (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES users(id),
  goal_type     varchar(50),
  title_ml      text,
  title_en      text,
  target_value  decimal(10,2),
  target_unit   varchar(20),
  current_value decimal(10,2),
  start_value   decimal(10,2),
  start_date    date DEFAULT CURRENT_DATE,
  target_date   date,
  status        varchar(20) NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active','achieved','abandoned')),
  notes         text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  deleted_at    timestamptz
);
CREATE INDEX IF NOT EXISTS idx_health_goals_user ON health_goals (user_id, status) WHERE deleted_at IS NULL;
