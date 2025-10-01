-- Fact: Sessions
-- Session-level facts with dimension keys

{{ config(
    materialized='table',
    partition_by={
        "field": "session_date",
        "data_type": "date",
        "granularity": "day"
    }
) }}

WITH sessions AS (
    SELECT * FROM {{ ref('stg_sessions') }}
),

final AS (
    SELECT
        session_id,
        user_key,
        user_id,
        anonymous_id,
        
        -- Session timing
        session_start,
        session_end,
        session_duration_seconds,
        session_date,
        
        -- Session metrics
        event_count,
        page_view_count,
        is_bounce,
        
        -- Device dimension
        {{ dbt_utils.generate_surrogate_key(['device_type', 'os_name', 'browser_name']) }} AS device_key,
        
        -- Geo dimension
        {{ dbt_utils.generate_surrogate_key(['country', 'region', 'city']) }} AS geo_key,
        
        -- First touch attribution
        first_utm_source,
        first_utm_medium,
        first_utm_campaign,
        first_referrer
        
    FROM sessions
)

SELECT * FROM final
