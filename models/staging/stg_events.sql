-- Staging model: Clean and normalize raw events
-- Minimal transformations, just standardization

WITH source AS (
    SELECT * FROM {{ source('raw', 'raw_events') }}
),

cleaned AS (
    SELECT
        id AS event_id,
        event_name,
        event_timestamp,
        event_date,
        
        -- User identifiers
        COALESCE(user_id, anonymous_id) AS user_key,
        user_id,
        anonymous_id,
        session_id,
        
        -- Event properties
        properties,
        user_properties,
        
        -- Device context
        LOWER(COALESCE(device_type, 'unknown')) AS device_type,
        device_model,
        LOWER(COALESCE(os_name, 'unknown')) AS os_name,
        os_version,
        LOWER(COALESCE(browser_name, 'unknown')) AS browser_name,
        browser_version,
        
        -- Geo context
        UPPER(COALESCE(country, 'UNKNOWN')) AS country,
        region,
        city,
        
        -- Page context
        page_url,
        page_title,
        page_path,
        referrer,
        
        -- UTM parameters
        LOWER(utm_source) AS utm_source,
        LOWER(utm_medium) AS utm_medium,
        LOWER(utm_campaign) AS utm_campaign,
        LOWER(utm_term) AS utm_term,
        LOWER(utm_content) AS utm_content,
        
        -- Technical metadata
        ip_address,
        user_agent,
        screen_width,
        screen_height,
        viewport_width,
        viewport_height,
        
        -- Ingestion metadata
        received_at,
        processed
        
    FROM source
)

SELECT * FROM cleaned
