-- Gamification system: levels, points, streaks, badges

CREATE TABLE IF NOT EXISTS user_gamification (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  points INT DEFAULT 0,
  level INT DEFAULT 1,
  current_streak INT DEFAULT 0,
  max_streak INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_name VARCHAR(100) NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, badge_name)
);

CREATE TABLE IF NOT EXISTS activity_points (
  activity VARCHAR(100) PRIMARY KEY,
  points INT NOT NULL CHECK (points > 0)
);

INSERT INTO activity_points (activity, points) VALUES
  ('book_appointment', 10),
  ('complete_health_tracker', 5),
  ('answer_qa', 20),
  ('write_review', 15),
  ('referral_signup', 50),
  ('achieve_health_goal', 30),
  ('seven_day_streak', 25)
ON CONFLICT DO NOTHING;

CREATE INDEX idx_user_gamification_level ON user_gamification(level DESC);
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
