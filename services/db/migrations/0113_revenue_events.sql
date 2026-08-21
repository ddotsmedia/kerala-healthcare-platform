-- P-G5: manually-recorded revenue tracking (payment integration deferred). Additive only.

CREATE TABLE IF NOT EXISTS revenue_events (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  type        varchar(50) NOT NULL
                CHECK (type IN ('featured_listing','premium_subscription','job_post','bulk_import','api_access')),
  amount_inr  integer NOT NULL,
  entity_id   uuid,
  entity_type varchar(50),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz,
  deleted_at  timestamptz
);

CREATE INDEX IF NOT EXISTS idx_revenue_events_date ON revenue_events (created_at DESC) WHERE deleted_at IS NULL;
