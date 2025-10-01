-- Create users dimension table (SCD Type 1 - overwrite)
-- This will be populated by dbt transformations

CREATE TABLE IF NOT EXISTS dim_users (
  user_id TEXT PRIMARY KEY,
  anonymous_id TEXT,
  
  -- User attributes (latest known values)
  email TEXT,
  name TEXT,
  
  -- First touch attribution
  first_seen_at TIMESTAMPTZ,
  first_utm_source TEXT,
  first_utm_medium TEXT,
  first_utm_campaign TEXT,
  first_referrer TEXT,
  first_device_type TEXT,
  first_country TEXT,
  
  -- Latest touch
  last_seen_at TIMESTAMPTZ,
  last_device_type TEXT,
  last_country TEXT,
  
  -- Aggregate metrics
  total_sessions INTEGER DEFAULT 0,
  total_events INTEGER DEFAULT 0,
  total_page_views INTEGER DEFAULT 0,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_dim_users_email ON dim_users(email);
CREATE INDEX IF NOT EXISTS idx_dim_users_first_seen ON dim_users(first_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_dim_users_last_seen ON dim_users(last_seen_at DESC);

-- Enable RLS
ALTER TABLE dim_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read their own data" ON dim_users
  FOR SELECT
  USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
