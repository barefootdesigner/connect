-- Create nurseries table
CREATE TABLE nurseries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nursery_name TEXT NOT NULL,
  address TEXT,
  town TEXT,
  county TEXT,
  postcode TEXT NOT NULL,
  phone TEXT,
  nursery_group TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for searching by name
CREATE INDEX idx_nurseries_name ON nurseries(nursery_name);
CREATE INDEX idx_nurseries_postcode ON nurseries(postcode);

-- Enable Row Level Security
ALTER TABLE nurseries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read nurseries" ON nurseries
  FOR SELECT USING (true);

CREATE POLICY "Allow all operations for now" ON nurseries
  FOR ALL USING (true) WITH CHECK (true);

-- Create jobs table
CREATE TABLE jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nursery_id UUID REFERENCES nurseries(id) ON DELETE CASCADE,
  nursery_name TEXT NOT NULL,
  nursery_location TEXT,
  postcode TEXT,
  job_title TEXT NOT NULL,
  hours TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_jobs_nursery_id ON jobs(nursery_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_job_title ON jobs(job_title);

-- Enable Row Level Security
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can read active jobs" ON jobs
  FOR SELECT USING (status = 'active');

CREATE POLICY "Allow all operations for now" ON jobs
  FOR ALL USING (true) WITH CHECK (true);
