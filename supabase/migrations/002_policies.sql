-- Create policies table
CREATE TABLE policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for sorting by upload date
CREATE INDEX idx_policies_uploaded_at ON policies(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;

-- Create policies for reading and managing
CREATE POLICY "Anyone can read policies" ON policies
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for now" ON policies
  FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for policy files
INSERT INTO storage.buckets (id, name, public)
VALUES ('policies', 'policies', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can view policy files" ON storage.objects
  FOR SELECT USING (bucket_id = 'policies');

CREATE POLICY "Allow all operations on policy files for now" ON storage.objects
  FOR ALL USING (bucket_id = 'policies') WITH CHECK (bucket_id = 'policies');
