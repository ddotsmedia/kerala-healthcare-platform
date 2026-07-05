-- 0036_waitlist.sql
-- Interest waitlist for upcoming features (support groups, home nursing, reminders).

CREATE TABLE IF NOT EXISTS waitlist (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email      text NOT NULL,
  topic      text NOT NULL,
  locale     text DEFAULT 'ml',
  created_at timestamptz DEFAULT now(),
  UNIQUE (email, topic)
);
CREATE INDEX IF NOT EXISTS idx_waitlist_topic ON waitlist (topic);
