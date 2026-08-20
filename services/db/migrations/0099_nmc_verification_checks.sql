-- 0099_nmc_verification_checks.sql
-- NMC registry cross-check log for doctor verification. Additive only.

CREATE TABLE IF NOT EXISTS nmc_verification_checks (
  id                      uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id             uuid REFERENCES doctors(id),
  nmc_registration_number varchar(100),
  council                 varchar(100),
  check_method            varchar(50),   -- manual|api|scrape
  check_result            jsonb,
  verified                boolean DEFAULT false,
  checked_by              uuid REFERENCES users(id),
  checked_at              timestamptz,
  created_at              timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_nmc_checks_provider ON nmc_verification_checks (provider_id);
