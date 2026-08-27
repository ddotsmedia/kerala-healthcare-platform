CREATE TABLE IF NOT EXISTS health_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  emoji VARCHAR(10),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  points INT DEFAULT 100,
  target VARCHAR(255),
  category VARCHAR(50),
  participant_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS user_challenge_participation (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  challenge_id UUID NOT NULL REFERENCES health_challenges(id),
  current_progress INT DEFAULT 0,
  points_earned INT DEFAULT 0,
  completed_at TIMESTAMP,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);
