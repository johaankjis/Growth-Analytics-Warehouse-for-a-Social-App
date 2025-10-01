-- Create raw events table for event ingestion
-- This is the bronze layer - stores raw event data as received

CREATE TABLE IF NOT EXISTS raw_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_id TEXT,
  anonymous_id TEXT,
  session_id TEXT,
  
  -- Event properties (stored as JSONB for flexibility)
  properties JSONB DEFAULT '{}'::jsonb,
  
  -- User properties
  user_properties JSONB DEFAULT '{}'::jsonb,
  
  -- Device & context
  device_type TEXT,
  device_model TEXT,
  os_name TEXT,
  os_version TEXT,
  browser_name TEXT,
  browser_version TEXT,
  
  -- Geo data
  country TEXT,
  region TEXT,
  city TEXT,
  
  -- Page context
  page_url TEXT,
  page_title TEXT,
  page_path TEXT,
  referrer TEXT,
  
  -- UTM parameters
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  
  -- Technical metadata
  ip_address TEXT,
  user_agent TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  viewport_width INTEGER,
  viewport_height INTEGER,
  
  -- Ingestion metadata
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed BOOLEAN DEFAULT FALSE,
  
  -- Partitioning helper (for future optimization)
  event_date DATE GENERATED ALWAYS AS (DATE(event_timestamp)) STORED
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_raw_events_event_name ON raw_events(event_name);
CREATE INDEX IF NOT EXISTS idx_raw_events_user_id ON raw_events(user_id);
CREATE INDEX IF NOT EXISTS idx_raw_events_session_id ON raw_events(session_id);
CREATE INDEX IF NOT EXISTS idx_raw_events_event_timestamp ON raw_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_raw_events_event_date ON raw_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_raw_events_processed ON raw_events(processed) WHERE processed = FALSE;

-- Create index on JSONB properties for common queries
CREATE INDEX IF NOT EXISTS idx_raw_events_properties ON raw_events USING GIN(properties);

-- Enable Row Level Security (RLS is disabled for event ingestion endpoint)
-- Events are public write, but we'll add policies for read access
ALTER TABLE raw_events ENABLE ROW LEVEL SECURITY;

-- Allow public insert (for event ingestion)
CREATE POLICY "Allow public event ingestion" ON raw_events
  FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users to read their own events
CREATE POLICY "Users can read their own events" ON raw_events
  FOR SELECT
  USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
