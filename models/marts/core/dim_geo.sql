-- Dimension: Geography
-- Country, region, city combinations

{{ config(
    materialized='table'
) }}

WITH events AS (
    SELECT * FROM {{ ref('stg_events') }}
),

geo_combinations AS (
    SELECT DISTINCT
        country,
        region,
        city,
        COUNT(*) AS event_count
    FROM events
    GROUP BY 1, 2, 3
)

SELECT
    {{ dbt_utils.generate_surrogate_key(['country', 'region', 'city']) }} AS geo_key,
    country,
    region,
    city,
    event_count,
    CURRENT_TIMESTAMP AS updated_at
FROM geo_combinations
