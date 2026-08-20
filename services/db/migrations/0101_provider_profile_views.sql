-- Provider profile view tracking (append-only event log) for doctor analytics.
-- Additive only. High-volume log: no soft-delete/updated_at needed.

CREATE TABLE IF NOT EXISTS provider_profile_views (
  id             uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id    uuid NOT NULL REFERENCES doctors(id),
  viewer_ip      inet,
  viewer_user_id uuid REFERENCES users(id),
  locale         varchar(5),
  viewed_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_provider_views
  ON provider_profile_views (provider_id, viewed_at);
