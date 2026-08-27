CREATE TABLE admin_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  feature_flag VARCHAR(100) UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_admin_features_feature_flag ON admin_features(feature_flag);

INSERT INTO admin_features (id, name, feature_flag, enabled, description) VALUES
  (uuid_generate_v4(), 'Gamification', 'gamification', true, 'Enable gamification system'),
  (uuid_generate_v4(), 'Push Notifications', 'push_notifications', true, 'Enable push notifications'),
  (uuid_generate_v4(), 'Telehealth', 'telehealth', false, 'Enable telehealth features'),
  (uuid_generate_v4(), 'Prescription Refill', 'prescription_refill', false, 'Enable prescription refill')
ON CONFLICT DO NOTHING;
