-- Metric: Weekly Active Users (WAU)

{{ config(
    materialized='table'
) }}

WITH events AS (
    SELECT * FROM {{ ref('fact_events') }}
),

wau AS (
    SELECT
        DATE_TRUNC('week', event_date)::DATE AS week_start,
        COUNT(DISTINCT user_key) AS wau,
        COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN user_key END) AS wau_identified,
        COUNT(DISTINCT CASE WHEN user_id IS NULL THEN user_key END) AS wau_anonymous
    FROM events
    GROUP BY week_start
)

SELECT * FROM wau
ORDER BY week_start DESC
