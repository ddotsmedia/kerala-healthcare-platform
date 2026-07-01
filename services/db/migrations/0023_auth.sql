-- 0023_auth.sql
-- Real OTP/JWT auth support. Additive only.
-- NOTE: spec calls for Redis-backed OTP + refresh tokens; Redis is not running
-- in this environment, so OTP codes and refresh tokens are persisted in Postgres
-- (same guarantees, swappable later). See BLOCKERS.md.

-- Deterministic mobile hash for login lookup (mobile_enc stays encrypted).
ALTER TABLE users ADD COLUMN IF NOT EXISTS mobile_hash text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_mobile_hash ON users (mobile_hash) WHERE mobile_hash IS NOT NULL;

CREATE TABLE IF NOT EXISTS otp_codes (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  mobile_hash  text NOT NULL,
  code_hash    text NOT NULL,
  expires_at   timestamptz NOT NULL,
  attempts     integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_otp_mobile ON otp_codes (mobile_hash);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      uuid NOT NULL REFERENCES users(id),
  token_hash   text NOT NULL,
  expires_at   timestamptz NOT NULL,
  revoked_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_refresh_token_hash ON refresh_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_user ON refresh_tokens (user_id) WHERE revoked_at IS NULL;
