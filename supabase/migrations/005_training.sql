-- Create training_content table (single row for page content)
CREATE TABLE training_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default empty content
INSERT INTO training_content (content) VALUES ('');

-- Enable Row Level Security
ALTER TABLE training_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read training content" ON training_content
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for now" ON training_content
  FOR ALL USING (true) WITH CHECK (true);

-- Create training_files table
CREATE TABLE training_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for sorting by upload date
CREATE INDEX idx_training_files_uploaded_at ON training_files(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE training_files ENABLE ROW LEVEL SECURITY;

-- Create policies for files
CREATE POLICY "Anyone can read training files" ON training_files
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for now" ON training_files
  FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for training files
INSERT INTO storage.buckets (id, name, public)
VALUES ('training', 'training', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can view training files" ON storage.objects
  FOR SELECT USING (bucket_id = 'training');

CREATE POLICY "Allow all operations on training files for now" ON storage.objects
  FOR ALL USING (bucket_id = 'training') WITH CHECK (bucket_id = 'training');
