-- Create fact_events table (aggregated from raw_events)
CREATE TABLE IF NOT EXISTS fact_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_date DATE NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL,
  event_name TEXT NOT NULL,
  user_key TEXT,
  session_id TEXT,
  page_path TEXT,
  page_title TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_category TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_fact_events_date ON fact_events(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_fact_events_name ON fact_events(event_name);
CREATE INDEX IF NOT EXISTS idx_fact_events_user ON fact_events(user_key);
CREATE INDEX IF NOT EXISTS idx_fact_events_session ON fact_events(session_id);

-- Create fact_sessions table (aggregated from sessions)
CREATE TABLE IF NOT EXISTS fact_sessions (
  session_id TEXT PRIMARY KEY,
  session_date DATE NOT NULL,
  session_start TIMESTAMPTZ NOT NULL,
  session_end TIMESTAMPTZ,
  user_key TEXT,
  session_duration_seconds INTEGER,
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  is_bounce BOOLEAN DEFAULT FALSE,
  landing_page TEXT,
  exit_page TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  device_category TEXT,
  browser TEXT,
  os TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_fact_sessions_date ON fact_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_fact_sessions_user ON fact_sessions(user_key);

-- Create daily_active_users materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_active_users AS
SELECT 
  event_date,
  COUNT(DISTINCT user_key) as active_users,
  COUNT(*) as total_events
FROM raw_events
WHERE user_key IS NOT NULL
GROUP BY event_date
ORDER BY event_date DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_dau_date ON daily_active_users(event_date);

-- Create weekly_active_users materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS weekly_active_users AS
SELECT 
  DATE_TRUNC('week', event_date)::DATE as week_start,
  COUNT(DISTINCT user_key) as active_users,
  COUNT(*) as total_events
FROM raw_events
WHERE user_key IS NOT NULL
GROUP BY DATE_TRUNC('week', event_date)
ORDER BY week_start DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_wau_week ON weekly_active_users(week_start);

-- Create monthly_active_users materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_active_users AS
SELECT 
  DATE_TRUNC('month', event_date)::DATE as month_start,
  COUNT(DISTINCT user_key) as active_users,
  COUNT(*) as total_events
FROM raw_events
WHERE user_key IS NOT NULL
GROUP BY DATE_TRUNC('month', event_date)
ORDER BY month_start DESC;

CREATE UNIQUE INDEX IF NOT EXISTS idx_mau_month ON monthly_active_users(month_start);

-- Create retention_cohorts materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS retention_cohorts AS
WITH first_seen AS (
  SELECT 
    user_key,
    MIN(event_date) as cohort_date
  FROM raw_events
  WHERE user_key IS NOT NULL
  GROUP BY user_key
),
user_activity AS (
  SELECT DISTINCT
    r.user_key,
    f.cohort_date,
    r.event_date,
    (r.event_date - f.cohort_date) as days_since_cohort
  FROM raw_events r
  JOIN first_seen f ON r.user_key = f.user_key
  WHERE r.user_key IS NOT NULL
)
SELECT 
  cohort_date,
  days_since_cohort,
  COUNT(DISTINCT user_key) as retained_users
FROM user_activity
WHERE days_since_cohort >= 0 AND days_since_cohort <= 30
GROUP BY cohort_date, days_since_cohort
ORDER BY cohort_date DESC, days_since_cohort ASC;

CREATE INDEX IF NOT EXISTS idx_retention_cohort ON retention_cohorts(cohort_date, days_since_cohort);

-- Create event_funnel materialized view (example funnel)
CREATE MATERIALIZED VIEW IF NOT EXISTS event_funnel AS
WITH funnel_steps AS (
  SELECT 1 as step_number, 'page_view' as step_name, 'Page View' as step_display
  UNION ALL
  SELECT 2, 'click', 'Click Event'
  UNION ALL
  SELECT 3, 'form_submit', 'Form Submit'
  UNION ALL
  SELECT 4, 'conversion', 'Conversion'
),
step_sessions AS (
  SELECT 
    fs.step_number,
    fs.step_name,
    fs.step_display,
    COUNT(DISTINCT CASE WHEN r.event_name = fs.step_name THEN r.session_id END) as sessions_reached
  FROM funnel_steps fs
  LEFT JOIN raw_events r ON r.event_name = fs.step_name
  GROUP BY fs.step_number, fs.step_name, fs.step_display
)
SELECT 
  step_number,
  step_name,
  step_display,
  sessions_reached,
  ROUND(
    100.0 * sessions_reached / NULLIF(LAG(sessions_reached) OVER (ORDER BY step_number), 0),
    2
  ) as conversion_rate
FROM step_sessions
ORDER BY step_number;

CREATE UNIQUE INDEX IF NOT EXISTS idx_funnel_step ON event_funnel(step_number);

-- Enable RLS on new tables
ALTER TABLE fact_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust based on your security needs)
CREATE POLICY "Allow public read access to fact_events" ON fact_events
  FOR SELECT USING (true);

CREATE POLICY "Allow public read access to fact_sessions" ON fact_sessions
  FOR SELECT USING (true);

-- Grant permissions
GRANT SELECT ON daily_active_users TO anon, authenticated;
GRANT SELECT ON weekly_active_users TO anon, authenticated;
GRANT SELECT ON monthly_active_users TO anon, authenticated;
GRANT SELECT ON retention_cohorts TO anon, authenticated;
GRANT SELECT ON event_funnel TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON fact_events TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON fact_sessions TO anon, authenticated;

-- Refresh materialized views
REFRESH MATERIALIZED VIEW daily_active_users;
REFRESH MATERIALIZED VIEW weekly_active_users;
REFRESH MATERIALIZED VIEW monthly_active_users;
REFRESH MATERIALIZED VIEW retention_cohorts;
REFRESH MATERIALIZED VIEW event_funnel;
