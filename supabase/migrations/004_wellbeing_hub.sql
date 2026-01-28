-- Create wellbeing_content table (single row for page content)
CREATE TABLE wellbeing_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default empty content
INSERT INTO wellbeing_content (content) VALUES ('');

-- Enable Row Level Security
ALTER TABLE wellbeing_content ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read wellbeing content" ON wellbeing_content
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for now" ON wellbeing_content
  FOR ALL USING (true) WITH CHECK (true);

-- Create wellbeing_images table
CREATE TABLE wellbeing_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for sorting by upload date
CREATE INDEX idx_wellbeing_images_uploaded_at ON wellbeing_images(uploaded_at DESC);

-- Enable Row Level Security
ALTER TABLE wellbeing_images ENABLE ROW LEVEL SECURITY;

-- Create policies for images
CREATE POLICY "Anyone can read wellbeing images" ON wellbeing_images
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for now" ON wellbeing_images
  FOR ALL USING (true) WITH CHECK (true);

-- Create storage bucket for wellbeing images
INSERT INTO storage.buckets (id, name, public)
VALUES ('wellbeing', 'wellbeing', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies
CREATE POLICY "Anyone can view wellbeing images" ON storage.objects
  FOR SELECT USING (bucket_id = 'wellbeing');

CREATE POLICY "Allow all operations on wellbeing images for now" ON storage.objects
  FOR ALL USING (bucket_id = 'wellbeing') WITH CHECK (bucket_id = 'wellbeing');
