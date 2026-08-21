-- P-G4: link conversion events to content for article analytics. Additive only.

ALTER TABLE conversion_events
  ADD COLUMN IF NOT EXISTS content_id uuid;

CREATE INDEX IF NOT EXISTS idx_conversion_events_content
  ON conversion_events (content_id, event_type) WHERE content_id IS NOT NULL;
