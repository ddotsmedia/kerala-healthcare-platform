-- 0017_users.sql
-- Minimal users table. Additive only. Needed as the FK target for appointments
-- (patient_id) and verification (verified_by). Full OTP/JWT auth is Phase 2 work
-- not yet built — see BLOCKERS.md. Sensitive contact stored encrypted (pgcrypto).

CREATE TABLE IF NOT EXISTS users (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  role        text NOT NULL DEFAULT 'patient'
               CHECK (role IN ('patient','doctor','hospital_admin','content_editor','verification_agent','platform_admin')),
  full_name   text,
  mobile_enc  bytea,
  email_enc   bytea,
  locale      text NOT NULL DEFAULT 'ml',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users (role) WHERE deleted_at IS NULL;
