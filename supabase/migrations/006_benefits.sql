-- Create benefits_content table (single row for page content)
CREATE TABLE benefits_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default empty content
INSERT INTO benefits_content (content) VALUES ('');

-- Enable Row Level Security
ALTER TABLE benefits_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read benefits content" ON benefits_content
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for now" ON benefits_content
  FOR ALL USING (true) WITH CHECK (true);
