-- 0028_notifications_inapp.sql
-- Generic in-app notifications (jobs status changes, etc). Additive only.

CREATE TABLE IF NOT EXISTS notifications (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    uuid NOT NULL REFERENCES users(id),
  type       varchar(40) NOT NULL,
  title      text,
  body       text,
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, read_at);
