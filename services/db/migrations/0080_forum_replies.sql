-- 0080_forum_replies.sql
-- Community forum replies. Additive only. All replies start pending (moderated).

CREATE TABLE IF NOT EXISTS forum_replies (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id         uuid NOT NULL REFERENCES forum_posts(id),
  author_id       uuid NOT NULL REFERENCES users(id),
  body            text NOT NULL,
  is_anonymous    boolean DEFAULT false,
  is_doctor_reply boolean DEFAULT false,
  status          varchar(20) DEFAULT 'pending',  -- pending|approved|rejected|flagged
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz,
  deleted_at      timestamptz
);
CREATE INDEX IF NOT EXISTS idx_forum_replies_post ON forum_replies (post_id, status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_forum_replies_status ON forum_replies (status) WHERE deleted_at IS NULL;
