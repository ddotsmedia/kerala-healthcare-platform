CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  value_type VARCHAR(50) DEFAULT 'string',
  category VARCHAR(100),
  updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_system_settings_setting_key ON system_settings(setting_key);
CREATE INDEX idx_system_settings_category ON system_settings(category);
