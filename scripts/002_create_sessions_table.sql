-- Create sessions table for session tracking
-- This will be populated by dbt transformations

CREATE TABLE IF NOT EXISTS sessions (
  session_id TEXT PRIMARY KEY,
  user_id TEXT,
  anonymous_id TEXT,
  
  -- Session timing
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  session_duration_seconds INTEGER,
  
  -- Session metrics
  event_count INTEGER DEFAULT 0,
  page_view_count INTEGER DEFAULT 0,
  
  -- First touch attribution
  first_utm_source TEXT,
  first_utm_medium TEXT,
  first_utm_campaign TEXT,
  first_referrer TEXT,
  
  -- Device & geo (from first event)
  device_type TEXT,
  os_name TEXT,
  browser_name TEXT,
  country TEXT,
  region TEXT,
  city TEXT,
  
  -- Session metadata
  is_bounce BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Partitioning helper
  session_date DATE GENERATED ALWAYS AS (DATE(session_start)) STORED
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_session_start ON sessions(session_start DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_session_date ON sessions(session_date DESC);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own sessions
CREATE POLICY "Users can read their own sessions" ON sessions
  FOR SELECT
  USING (auth.uid()::text = user_id OR auth.role() = 'service_role');
