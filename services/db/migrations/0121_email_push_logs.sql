CREATE TABLE email_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  target_audience VARCHAR(50) NOT NULL,
  recipients_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  template_id UUID,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE TABLE push_notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  target_audience VARCHAR(50) NOT NULL,
  recipients_count INT DEFAULT 0,
  delivered_count INT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
CREATE INDEX idx_push_notification_logs_created_at ON push_notification_logs(created_at DESC);
