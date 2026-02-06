-- Create app_settings table to store configuration like Slack webhook
CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id)
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_app_settings_key ON app_settings(key);

-- Insert default empty Slack webhook setting
INSERT INTO app_settings (key, value) 
VALUES ('slack_webhook_url', '')
ON CONFLICT (key) DO NOTHING;
