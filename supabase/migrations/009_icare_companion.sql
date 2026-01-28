-- Create icare_settings table (single row for chat configuration)
CREATE TABLE icare_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_url TEXT NOT NULL DEFAULT 'https://merry-insight-production.up.railway.app',
  enabled BOOLEAN NOT NULL DEFAULT true,
  welcome_message TEXT NOT NULL DEFAULT 'Hi! I''m iCare Companion. How can I help you today?',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO icare_settings (chat_url, enabled) VALUES ('https://merry-insight-production.up.railway.app', true);

-- Enable Row Level Security
ALTER TABLE icare_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read icare settings" ON icare_settings
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for now" ON icare_settings
  FOR ALL USING (true) WITH CHECK (true);
