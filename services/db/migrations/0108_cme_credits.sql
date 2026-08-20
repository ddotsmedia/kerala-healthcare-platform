-- P-F10: doctor CME (Continuing Medical Education) credit tracking. Additive only.
-- event_id is a nullable uuid with no FK: a platform cme_events table is not yet
-- modelled, and external CME has no event.

CREATE TABLE IF NOT EXISTS cme_credits (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id     uuid NOT NULL REFERENCES doctors(id),
  event_id        uuid,
  title           text NOT NULL,
  organiser       text,
  date            date NOT NULL,
  credits         numeric(4,1) NOT NULL,
  certificate_url text,
  category        varchar(50) NOT NULL DEFAULT 'general'
                    CHECK (category IN ('clinical','research','ethics','professional','general')),
  is_verified     boolean NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz,
  deleted_at      timestamptz
);

CREATE INDEX IF NOT EXISTS idx_cme_provider_date
  ON cme_credits (provider_id, date DESC) WHERE deleted_at IS NULL;
