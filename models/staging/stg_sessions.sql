-- Staging model: Session data
-- Build sessions from raw events

WITH events AS (
    SELECT * FROM {{ ref('stg_events') }}
),

session_boundaries AS (
    SELECT
        session_id,
        user_key,
        user_id,
        anonymous_id,
        
        MIN(event_timestamp) AS session_start,
        MAX(event_timestamp) AS session_end,
        COUNT(*) AS event_count,
        COUNT(CASE WHEN event_name = 'page_view' THEN 1 END) AS page_view_count,
        
        -- First touch attribution (from first event in session)
        MIN(event_timestamp) AS first_event_time
        
    FROM events
    WHERE session_id IS NOT NULL
    GROUP BY 1, 2, 3, 4
),

first_event_context AS (
    SELECT DISTINCT ON (e.session_id)
        e.session_id,
        e.utm_source AS first_utm_source,
        e.utm_medium AS first_utm_medium,
        e.utm_campaign AS first_utm_campaign,
        e.referrer AS first_referrer,
        e.device_type,
        e.os_name,
        e.browser_name,
        e.country,
        e.region,
        e.city
    FROM events e
    INNER JOIN session_boundaries sb ON e.session_id = sb.session_id
    WHERE e.event_timestamp = sb.first_event_time
    ORDER BY e.session_id, e.event_timestamp
),

final AS (
    SELECT
        sb.session_id,
        sb.user_key,
        sb.user_id,
        sb.anonymous_id,
        sb.session_start,
        sb.session_end,
        EXTRACT(EPOCH FROM (sb.session_end - sb.session_start))::INTEGER AS session_duration_seconds,
        sb.event_count,
        sb.page_view_count,
        
        -- First touch attribution
        fec.first_utm_source,
        fec.first_utm_medium,
        fec.first_utm_campaign,
        fec.first_referrer,
        
        -- Device & geo
        fec.device_type,
        fec.os_name,
        fec.browser_name,
        fec.country,
        fec.region,
        fec.city,
        
        -- Session quality
        CASE 
            WHEN sb.event_count = 1 AND sb.page_view_count <= 1 THEN TRUE
            ELSE FALSE
        END AS is_bounce,
        
        DATE(sb.session_start) AS session_date
        
    FROM session_boundaries sb
    LEFT JOIN first_event_context fec ON sb.session_id = fec.session_id
)

SELECT * FROM final
