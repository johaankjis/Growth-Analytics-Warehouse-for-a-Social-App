# dbt Analytics Models

This directory contains dbt models for transforming raw event data into analytics-ready tables.

## Structure

\`\`\`
models/
├── staging/          # stg_ models: minimal cleaning and normalization
│   ├── stg_events.sql
│   └── stg_sessions.sql
├── marts/
│   ├── core/        # Dimensional model (facts and dimensions)
│   │   ├── dim_users.sql
│   │   ├── dim_devices.sql
│   │   ├── dim_geo.sql
│   │   ├── fact_events.sql
│   │   └── fact_sessions.sql
│   └── metrics/     # Pre-aggregated metrics
│       ├── daily_active_users.sql
│       ├── weekly_active_users.sql
│       ├── monthly_active_users.sql
│       ├── retention_cohorts.sql
│       └── event_funnel.sql
\`\`\`

## Running dbt

### Prerequisites

1. Install dbt: `pip install dbt-postgres`
2. Set environment variables (already configured in Vercel):
   - POSTGRES_HOST
   - POSTGRES_USER
   - POSTGRES_PASSWORD
   - POSTGRES_DATABASE

### Commands

\`\`\`bash
# Install dependencies
dbt deps

# Run all models
dbt run

# Run specific model
dbt run --select stg_events

# Run tests
dbt test

# Generate documentation
dbt docs generate
dbt docs serve
\`\`\`

## Model Descriptions

### Staging Models

- **stg_events**: Cleaned and normalized events from raw_events
- **stg_sessions**: Session-level aggregations built from events

### Core Models (Dimensional)

- **dim_users**: User dimension with first/last touch attribution (SCD Type 1)
- **dim_devices**: Device, OS, and browser combinations
- **dim_geo**: Geography dimension (country, region, city)
- **fact_events**: Event-level facts with dimension keys
- **fact_sessions**: Session-level facts with dimension keys

### Metrics Models

- **daily_active_users**: DAU metrics
- **weekly_active_users**: WAU metrics
- **monthly_active_users**: MAU metrics
- **retention_cohorts**: User retention by cohort
- **event_funnel**: Conversion funnel analysis

## Materialization Strategy

- **Staging**: Views (fast, always fresh)
- **Core**: Tables (better query performance)
- **Metrics**: Tables (pre-aggregated for dashboards)

## Next Steps

1. Run the models: `dbt run`
2. Set up incremental models for large datasets
3. Add data quality tests
4. Schedule regular runs (GitHub Actions or Airflow)
\`\`\`

```json file="" isHidden
