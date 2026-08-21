-- P-G1: privacy-preserving page-view tracking (no personal data). Additive only.

CREATE TABLE IF NOT EXISTS page_views (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  path         text NOT NULL,
  locale       varchar(5),
  referrer     text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  session_id   varchar(64),
  viewed_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_path_date ON page_views (path, viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views (viewed_at DESC);
