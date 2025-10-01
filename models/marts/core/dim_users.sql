-- Dimension: Users (SCD Type 1 - overwrite)
-- Tracks user attributes and first/last touch

{{ config(
    materialized='table',
    unique_key='user_key'
) }}

WITH events AS (
    SELECT * FROM {{ ref('stg_events') }}
    WHERE user_key IS NOT NULL
),

user_first_touch AS (
    SELECT DISTINCT ON (user_key)
        user_key,
        user_id,
        anonymous_id,
        event_timestamp AS first_seen_at,
        utm_source AS first_utm_source,
        utm_medium AS first_utm_medium,
        utm_campaign AS first_utm_campaign,
        referrer AS first_referrer,
        device_type AS first_device_type,
        country AS first_country
    FROM events
    ORDER BY user_key, event_timestamp ASC
),

user_last_touch AS (
    SELECT DISTINCT ON (user_key)
        user_key,
        event_timestamp AS last_seen_at,
        device_type AS last_device_type,
        country AS last_country
    FROM events
    ORDER BY user_key, event_timestamp DESC
),

user_aggregates AS (
    SELECT
        user_key,
        COUNT(DISTINCT session_id) AS total_sessions,
        COUNT(*) AS total_events,
        COUNT(CASE WHEN event_name = 'page_view' THEN 1 END) AS total_page_views
    FROM events
    GROUP BY user_key
),

user_properties AS (
    SELECT DISTINCT ON (user_key)
        user_key,
        user_properties->>'email' AS email,
        user_properties->>'name' AS name
    FROM events
    WHERE user_properties IS NOT NULL
    ORDER BY user_key, event_timestamp DESC
),

final AS (
    SELECT
        ft.user_key,
        ft.user_id,
        ft.anonymous_id,
        
        -- User properties
        up.email,
        up.name,
        
        -- First touch
        ft.first_seen_at,
        ft.first_utm_source,
        ft.first_utm_medium,
        ft.first_utm_campaign,
        ft.first_referrer,
        ft.first_device_type,
        ft.first_country,
        
        -- Last touch
        lt.last_seen_at,
        lt.last_device_type,
        lt.last_country,
        
        -- Aggregates
        ua.total_sessions,
        ua.total_events,
        ua.total_page_views,
        
        -- Metadata
        CURRENT_TIMESTAMP AS updated_at
        
    FROM user_first_touch ft
    LEFT JOIN user_last_touch lt ON ft.user_key = lt.user_key
    LEFT JOIN user_aggregates ua ON ft.user_key = ua.user_key
    LEFT JOIN user_properties up ON ft.user_key = up.user_key
)

SELECT * FROM final
