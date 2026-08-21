-- P-H9: insurance panel (empanelment) info for doctors + hospitals. Additive only.

CREATE TABLE IF NOT EXISTS insurance_panels (
  id                     uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type            varchar(20) NOT NULL CHECK (entity_type IN ('doctor','hospital')),
  entity_id              uuid NOT NULL,
  insurer_name           text NOT NULL,
  policy_types           text[] NOT NULL DEFAULT '{}',   -- cashless | reimbursement
  network_type           varchar(50) NOT NULL DEFAULT 'empanelled'
                           CHECK (network_type IN ('preferred','empanelled','not_in_network')),
  max_cashless_limit_inr integer,
  notes                  text,
  is_verified            boolean NOT NULL DEFAULT false,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz,
  deleted_at             timestamptz
);

CREATE INDEX IF NOT EXISTS idx_insurance_entity ON insurance_panels (entity_type, entity_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_insurance_insurer ON insurance_panels (insurer_name) WHERE deleted_at IS NULL;
