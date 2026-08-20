-- 0100_hospital_admins.sql
-- Maps users to the hospital they administer (hospital admin portal). Additive.

CREATE TABLE IF NOT EXISTS hospital_admins (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES users(id),
  hospital_id uuid NOT NULL REFERENCES hospitals(id),
  role        varchar(50) DEFAULT 'admin',  -- admin|staff|readonly
  created_by  uuid REFERENCES users(id),
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz,
  deleted_at  timestamptz,
  UNIQUE (user_id, hospital_id)
);
CREATE INDEX IF NOT EXISTS idx_hospital_admins_user ON hospital_admins (user_id) WHERE is_active = true;
