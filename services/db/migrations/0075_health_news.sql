-- 0075_health_news.sql
-- P-D2: curated Kerala health news feed. Additive only.
-- (Spec labelled this 0085.)

CREATE TABLE IF NOT EXISTS health_news (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         varchar(255) UNIQUE NOT NULL,
  title_ml     text NOT NULL,
  title_en     text,
  summary_ml   text NOT NULL,
  summary_en   text,
  body_ml      text,
  body_en      text,
  source       text,
  source_url   text,
  category     varchar(50)
                 CHECK (category IN ('outbreak','advisory','policy','awareness','research')),
  district_id  uuid REFERENCES districts(id),
  importance   varchar(20) NOT NULL DEFAULT 'normal'
                 CHECK (importance IN ('breaking','high','normal')),
  image_url    text,
  published_at timestamptz NOT NULL DEFAULT now(),
  is_published boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),
  deleted_at   timestamptz
);

CREATE INDEX IF NOT EXISTS idx_news_published ON health_news (published_at DESC)
  WHERE is_published = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_news_category ON health_news (category, published_at DESC)
  WHERE is_published = true AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_news_district ON health_news (district_id)
  WHERE is_published = true AND deleted_at IS NULL;
