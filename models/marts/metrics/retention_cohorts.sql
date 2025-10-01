-- Metric: Retention Cohorts
-- Tracks user retention by cohort (first seen date)

{{ config(
    materialized='table'
) }}

WITH users AS (
    SELECT * FROM {{ ref('dim_users') }}
),

events AS (
    SELECT * FROM {{ ref('fact_events') }}
),

cohorts AS (
    SELECT
        user_key,
        DATE(first_seen_at) AS cohort_date
    FROM users
),

user_activity AS (
    SELECT
        e.user_key,
        c.cohort_date,
        DATE(e.event_timestamp) AS activity_date,
        (DATE(e.event_timestamp) - c.cohort_date) AS days_since_cohort
    FROM events e
    INNER JOIN cohorts c ON e.user_key = c.user_key
),

retention_matrix AS (
    SELECT
        cohort_date,
        days_since_cohort,
        COUNT(DISTINCT user_key) AS retained_users
    FROM user_activity
    GROUP BY cohort_date, days_since_cohort
),

cohort_sizes AS (
    SELECT
        cohort_date,
        COUNT(DISTINCT user_key) AS cohort_size
    FROM cohorts
    GROUP BY cohort_date
),

final AS (
    SELECT
        rm.cohort_date,
        rm.days_since_cohort,
        cs.cohort_size,
        rm.retained_users,
        ROUND(100.0 * rm.retained_users / cs.cohort_size, 2) AS retention_rate
    FROM retention_matrix rm
    INNER JOIN cohort_sizes cs ON rm.cohort_date = cs.cohort_date
)

SELECT * FROM final
ORDER BY cohort_date DESC, days_since_cohort ASC
