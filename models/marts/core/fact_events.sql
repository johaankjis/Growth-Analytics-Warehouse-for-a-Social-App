-- Fact: Events
-- Event-level facts with dimension keys

{{ config(
    materialized='table',
    partition_by={
        "field": "event_date",
        "data_type": "date",
        "granularity": "day"
    }
) }}

WITH events AS (
    SELECT * FROM {{ ref('stg_events') }}
),

final AS (
    SELECT
        event_id,
        event_name,
        event_timestamp,
        event_date,
        
        -- User dimension
        user_key,
        user_id,
        anonymous_id,
        session_id,
        
        -- Device dimension
        {{ dbt_utils.generate_surrogate_key(['device_type', 'os_name', 'browser_name']) }} AS device_key,
        
        -- Geo dimension
        {{ dbt_utils.generate_surrogate_key(['country', 'region', 'city']) }} AS geo_key,
        
        -- Event properties
        properties,
        
        -- Page context
        page_url,
        page_title,
        page_path,
        referrer,
        
        -- Attribution
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
        
        -- Metadata
        received_at
        
    FROM events
)

SELECT * FROM final
