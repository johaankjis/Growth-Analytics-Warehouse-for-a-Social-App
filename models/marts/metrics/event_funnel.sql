-- Metric: Event Funnel Analysis
-- Tracks conversion through a sequence of events

{{ config(
    materialized='table'
) }}

WITH events AS (
    SELECT * FROM {{ ref('fact_events') }}
),

-- Define funnel steps (customize as needed)
funnel_events AS (
    SELECT
        user_key,
        session_id,
        event_name,
        event_timestamp,
        CASE event_name
            WHEN 'page_view' THEN 1
            WHEN 'click' THEN 2
            WHEN 'form_submit' THEN 3
            WHEN 'purchase' THEN 4
            ELSE NULL
        END AS funnel_step
    FROM events
    WHERE event_name IN ('page_view', 'click', 'form_submit', 'purchase')
),

session_funnel AS (
    SELECT
        session_id,
        MAX(CASE WHEN funnel_step >= 1 THEN 1 ELSE 0 END) AS reached_step_1,
        MAX(CASE WHEN funnel_step >= 2 THEN 1 ELSE 0 END) AS reached_step_2,
        MAX(CASE WHEN funnel_step >= 3 THEN 1 ELSE 0 END) AS reached_step_3,
        MAX(CASE WHEN funnel_step >= 4 THEN 1 ELSE 0 END) AS reached_step_4
    FROM funnel_events
    GROUP BY session_id
),

funnel_summary AS (
    SELECT
        'page_view' AS step_name,
        1 AS step_number,
        SUM(reached_step_1) AS sessions_reached,
        NULL::NUMERIC AS conversion_rate
    FROM session_funnel
    
    UNION ALL
    
    SELECT
        'click' AS step_name,
        2 AS step_number,
        SUM(reached_step_2) AS sessions_reached,
        ROUND(100.0 * SUM(reached_step_2) / NULLIF(SUM(reached_step_1), 0), 2) AS conversion_rate
    FROM session_funnel
    
    UNION ALL
    
    SELECT
        'form_submit' AS step_name,
        3 AS step_number,
        SUM(reached_step_3) AS sessions_reached,
        ROUND(100.0 * SUM(reached_step_3) / NULLIF(SUM(reached_step_2), 0), 2) AS conversion_rate
    FROM session_funnel
    
    UNION ALL
    
    SELECT
        'purchase' AS step_name,
        4 AS step_number,
        SUM(reached_step_4) AS sessions_reached,
        ROUND(100.0 * SUM(reached_step_4) / NULLIF(SUM(reached_step_3), 0), 2) AS conversion_rate
    FROM session_funnel
)

SELECT * FROM funnel_summary
ORDER BY step_number
