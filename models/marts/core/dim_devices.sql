-- Dimension: Devices
-- Device, OS, and browser combinations

{{ config(
    materialized='table'
) }}

WITH events AS (
    SELECT * FROM {{ ref('stg_events') }}
),

device_combinations AS (
    SELECT DISTINCT
        device_type,
        os_name,
        browser_name,
        COUNT(*) AS event_count
    FROM events
    GROUP BY 1, 2, 3
)

SELECT
    {{ dbt_utils.generate_surrogate_key(['device_type', 'os_name', 'browser_name']) }} AS device_key,
    device_type,
    os_name,
    browser_name,
    event_count,
    CURRENT_TIMESTAMP AS updated_at
FROM device_combinations
