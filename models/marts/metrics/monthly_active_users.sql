-- Metric: Monthly Active Users (MAU)

{{ config(
    materialized='table'
) }}

WITH events AS (
    SELECT * FROM {{ ref('fact_events') }}
),

mau AS (
    SELECT
        DATE_TRUNC('month', event_date)::DATE AS month_start,
        COUNT(DISTINCT user_key) AS mau,
        COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN user_key END) AS mau_identified,
        COUNT(DISTINCT CASE WHEN user_id IS NULL THEN user_key END) AS mau_anonymous
    FROM events
    GROUP BY month_start
)

SELECT * FROM mau
ORDER BY month_start DESC
