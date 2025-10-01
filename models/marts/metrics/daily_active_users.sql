-- Metric: Daily Active Users (DAU)

{{ config(
    materialized='table'
) }}

WITH events AS (
    SELECT * FROM {{ ref('fact_events') }}
),

dau AS (
    SELECT
        event_date,
        COUNT(DISTINCT user_key) AS dau,
        COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN user_key END) AS dau_identified,
        COUNT(DISTINCT CASE WHEN user_id IS NULL THEN user_key END) AS dau_anonymous
    FROM events
    GROUP BY event_date
)

SELECT * FROM dau
ORDER BY event_date DESC
