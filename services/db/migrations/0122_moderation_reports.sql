CREATE TABLE moderation_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  content_id UUID NOT NULL,
  content_type VARCHAR(50) NOT NULL,
  content TEXT,
  reason VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  moderator_id UUID REFERENCES users(id),
  decision VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_moderation_reports_status ON moderation_reports(status);
CREATE INDEX idx_moderation_reports_created_at ON moderation_reports(created_at DESC);
CREATE INDEX idx_moderation_reports_user_id ON moderation_reports(user_id);
