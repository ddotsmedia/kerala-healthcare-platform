-- 0006_provider_verification.sql
-- Verification queue + audit trail for doctors and hospitals. Additive only.
-- Every verification decision is logged with actor, timestamp, and evidence reference.

CREATE TABLE IF NOT EXISTS provider_verifications (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),

  provider_type   text NOT NULL CHECK (provider_type IN ('doctor','hospital')),
  provider_id     uuid NOT NULL,

  -- Workflow state
  status          text NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','in_review','verified','rejected')),

  -- NMC registry cross-check result (doctors)
  nmc_checked     boolean NOT NULL DEFAULT false,
  nmc_match       boolean,

  -- Evidence + audit
  evidence_ref    text,
  notes           text,
  verified_by     uuid,            -- verification_agent / platform_admin user id
  verified_at     timestamptz,

  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_verif_provider ON provider_verifications (provider_type, provider_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_verif_status   ON provider_verifications (status) WHERE deleted_at IS NULL;
