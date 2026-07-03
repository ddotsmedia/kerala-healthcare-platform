-- 0031_email_otp.sql
-- Email OTP login alongside mobile OTP. Additive only.
-- Adds a deterministic email hash for login lookup and lets otp_codes hold
-- either a mobile_hash or an email_hash (mobile_hash relaxed to nullable).

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_hash text;
CREATE UNIQUE INDEX IF NOT EXISTS uq_users_email_hash ON users (email_hash) WHERE email_hash IS NOT NULL;

ALTER TABLE otp_codes ADD COLUMN IF NOT EXISTS email_hash text;
ALTER TABLE otp_codes ALTER COLUMN mobile_hash DROP NOT NULL;
CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_codes (email_hash);
