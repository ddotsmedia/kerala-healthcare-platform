-- Admin email + password login (alternative to mobile OTP). Additive only.
-- is_verified is added here too (not present on users before) — required by the
-- email-login gate.

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS email_plain    text,
  ADD COLUMN IF NOT EXISTS password_hash  text,
  ADD COLUMN IF NOT EXISTS admin_username text,
  ADD COLUMN IF NOT EXISTS is_verified    boolean NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS uq_users_admin_username
  ON users (admin_username) WHERE admin_username IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_email_plain
  ON users (lower(email_plain)) WHERE email_plain IS NOT NULL AND deleted_at IS NULL;
