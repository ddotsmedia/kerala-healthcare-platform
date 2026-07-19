-- 0079_forum_posts.sql
-- Community forum posts. Additive only. All posts start pending (moderated).

CREATE TABLE IF NOT EXISTS forum_posts (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug          varchar(255) UNIQUE NOT NULL,
  category_id   uuid NOT NULL REFERENCES forum_categories(id),
  author_id     uuid NOT NULL REFERENCES users(id),
  title         text NOT NULL,
  body          text NOT NULL,
  is_anonymous  boolean DEFAULT false,
  is_pinned     boolean DEFAULT false,
  status        varchar(20) DEFAULT 'pending',  -- pending|approved|rejected|flagged
  views         integer DEFAULT 0,
  reply_count   integer DEFAULT 0,
  last_reply_at timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz,
  deleted_at    timestamptz
);
CREATE INDEX IF NOT EXISTS idx_forum_posts_category ON forum_posts (category_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_forum_posts_status ON forum_posts (status) WHERE deleted_at IS NULL;
