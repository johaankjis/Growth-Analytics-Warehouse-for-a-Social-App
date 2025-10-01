-- Create materialized views for common metric calculations
-- These can be refreshed periodically for better performance

-- View: User engagement scores
CREATE OR REPLACE VIEW user_engagement_scores AS
SELECT
    u.user_key,
    u.user_id,
    u.total_sessions,
    u.total_events,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - u.last_seen_at)) / 86400 AS days_since_last_session,
    CASE
        WHEN u.total_sessions = 0 THEN 0
        ELSE EXTRACT(EPOCH FROM (u.last_seen_at - u.first_seen_at)) / u.total_sessions / 60
    END AS avg_session_duration_minutes,
    -- Engagement score (0-100)
    LEAST(
        (u.total_sessions * 2) + -- Frequency score (0-40)
        LEAST(CASE WHEN u.total_sessions = 0 THEN 0 ELSE EXTRACT(EPOCH FROM (u.last_seen_at - u.first_seen_at)) / u.total_sessions / 600 END, 30) + -- Duration score (0-30)
        GREATEST(30 - EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - u.last_seen_at)) / 86400, 0), -- Recency score (0-30)
        100
    ) AS engagement_score
FROM dim_users u;

-- View: Daily metrics summary
CREATE OR REPLACE VIEW daily_metrics_summary AS
SELECT
    event_date,
    COUNT(DISTINCT user_key) AS unique_users,
    COUNT(DISTINCT session_id) AS total_sessions,
    COUNT(*) AS total_events,
    COUNT(DISTINCT CASE WHEN event_name = 'page_view' THEN event_id END) AS page_views,
    COUNT(DISTINCT CASE WHEN event_name = 'click' THEN event_id END) AS clicks,
    COUNT(DISTINCT CASE WHEN event_name = 'form_submit' THEN event_id END) AS form_submits
FROM fact_events
GROUP BY event_date
ORDER BY event_date DESC;

-- View: Device breakdown
CREATE OR REPLACE VIEW device_metrics AS
SELECT
    device_type,
    os_name,
    browser_name,
    COUNT(DISTINCT user_key) AS unique_users,
    COUNT(DISTINCT session_id) AS total_sessions,
    COUNT(*) AS total_events,
    ROUND(AVG(CASE WHEN session_duration_seconds > 0 THEN session_duration_seconds END), 2) AS avg_session_duration
FROM fact_sessions
GROUP BY device_type, os_name, browser_name
ORDER BY unique_users DESC;

-- View: Geographic metrics
CREATE OR REPLACE VIEW geo_metrics AS
SELECT
    country,
    region,
    city,
    COUNT(DISTINCT user_key) AS unique_users,
    COUNT(DISTINCT session_id) AS total_sessions,
    COUNT(*) AS total_events
FROM fact_sessions
GROUP BY country, region, city
ORDER BY unique_users DESC;

-- View: Traffic sources
CREATE OR REPLACE VIEW traffic_sources AS
SELECT
    COALESCE(first_utm_source, 'direct') AS source,
    COALESCE(first_utm_medium, 'none') AS medium,
    COALESCE(first_utm_campaign, 'none') AS campaign,
    COUNT(DISTINCT user_key) AS unique_users,
    COUNT(DISTINCT session_id) AS total_sessions,
    ROUND(AVG(session_duration_seconds), 2) AS avg_session_duration,
    ROUND(100.0 * SUM(CASE WHEN is_bounce THEN 1 ELSE 0 END) / COUNT(*), 2) AS bounce_rate
FROM fact_sessions
GROUP BY first_utm_source, first_utm_medium, first_utm_campaign
ORDER BY unique_users DESC;

-- View: Weekly cohort retention
CREATE OR REPLACE VIEW weekly_retention AS
SELECT
    DATE_TRUNC('week', cohort_date)::DATE AS cohort_week,
    FLOOR(days_since_cohort / 7) AS weeks_since_cohort,
    SUM(cohort_size) AS cohort_size,
    SUM(retained_users) AS retained_users,
    ROUND(100.0 * SUM(retained_users) / SUM(cohort_size), 2) AS retention_rate
FROM retention_cohorts
GROUP BY cohort_week, weeks_since_cohort
ORDER BY cohort_week DESC, weeks_since_cohort ASC;
