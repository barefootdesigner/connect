-- Create hr_library_content table (single row for page content)
CREATE TABLE hr_library_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default empty content
INSERT INTO hr_library_content (content) VALUES ('');

-- Enable Row Level Security
ALTER TABLE hr_library_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read hr library content" ON hr_library_content
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for now" ON hr_library_content
  FOR ALL USING (true) WITH CHECK (true);

-- Create hr_library_sections table
CREATE TABLE hr_library_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for sorting by display order
CREATE INDEX idx_hr_library_sections_display_order ON hr_library_sections(display_order ASC);

-- Enable Row Level Security
ALTER TABLE hr_library_sections ENABLE ROW LEVEL SECURITY;

-- Create policies for sections
CREATE POLICY "Anyone can read hr library sections" ON hr_library_sections
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for now" ON hr_library_sections
  FOR ALL USING (true) WITH CHECK (true);

-- Create hr_library_files table
CREATE TABLE hr_library_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_id UUID NOT NULL REFERENCES hr_library_sections(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_hr_library_files_section_id ON hr_library_files(section_id);
CREATE INDEX idx_hr_library_files_display_order ON hr_library_files(section_id, display_order ASC);

-- Enable Row Level Security
ALTER TABLE hr_library_files ENABLE ROW LEVEL SECURITY;

-- Create policies for files
CREATE POLICY "Anyone can read hr library files" ON hr_library_files
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for now" ON hr_library_files
  FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for hr library files
INSERT INTO storage.buckets (id, name, public)
VALUES ('hr-library', 'hr-library', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can view hr library files" ON storage.objects
  FOR SELECT USING (bucket_id = 'hr-library');

CREATE POLICY "Allow all operations on hr library files for now" ON storage.objects
  FOR ALL USING (bucket_id = 'hr-library') WITH CHECK (bucket_id = 'hr-library');
