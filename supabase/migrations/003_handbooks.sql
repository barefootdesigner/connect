-- Create handbooks table
CREATE TABLE handbooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for sorting by upload date
CREATE INDEX idx_handbooks_uploaded_at ON handbooks(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE handbooks ENABLE ROW LEVEL SECURITY;

-- Create policies for reading and managing
CREATE POLICY "Anyone can read handbooks" ON handbooks
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for now" ON handbooks
  FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for handbook files
INSERT INTO storage.buckets (id, name, public)
VALUES ('handbooks', 'handbooks', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can view handbook files" ON storage.objects
  FOR SELECT USING (bucket_id = 'handbooks');

CREATE POLICY "Allow all operations on handbook files for now" ON storage.objects
  FOR ALL USING (bucket_id = 'handbooks') WITH CHECK (bucket_id = 'handbooks');
