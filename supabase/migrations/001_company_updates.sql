-- Create company_updates table
CREATE TABLE company_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for sorting by date
CREATE INDEX idx_company_updates_published_at ON company_updates(published_at DESC);

-- Enable Row Level Security (optional - can be configured later)
ALTER TABLE company_updates ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows everyone to read (adjust as needed)
CREATE POLICY "Anyone can read company updates" ON company_updates
  FOR SELECT USING (true);

-- Create a policy for authenticated users to insert/update/delete (adjust as needed)
CREATE POLICY "Authenticated users can manage company updates" ON company_updates
  FOR ALL USING (auth.role() = 'authenticated');
