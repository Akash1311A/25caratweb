-- Create the app_state table for persisting application data
CREATE TABLE IF NOT EXISTS app_state (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role full access
CREATE POLICY "Service role full access" ON app_state
  FOR ALL USING (auth.role() = 'service_role');

-- Create policy to allow public read access (optional, adjust as needed)
CREATE POLICY "Public read access" ON app_state
  FOR SELECT USING (true);
