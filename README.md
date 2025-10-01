# Growth Analytics Warehouse for a Social App

A production-ready analytics platform that combines a modern data warehouse with a real-time analytics dashboard. Built with Next.js, dbt, and Supabase, this project provides end-to-end event tracking, transformation, and visualization for growth analytics.

## 🚀 Features

### Analytics Dashboard
- **Real-time Metrics**: DAU, WAU, MAU, session duration, bounce rate
- **Retention Analysis**: Cohort retention tracking with visual charts
- **Conversion Funnels**: Multi-step conversion tracking and optimization
- **Event Analytics**: Top events and page views analysis
- **Interactive Visualizations**: Built with Recharts for responsive, beautiful charts
- **Date Range Filtering**: Flexible time-based analysis

### Data Warehouse
- **dbt Models**: Modular SQL transformations following best practices
- **Dimensional Model**: Star schema with fact and dimension tables
- **Pre-aggregated Metrics**: Optimized for dashboard performance
- **Event Tracking**: Comprehensive event ingestion and processing

### Infrastructure
- **Event Ingestion API**: RESTful endpoint for tracking events
- **Metrics API**: Type-safe endpoints for all analytics queries
- **PostgreSQL Backend**: Powered by Supabase with Row Level Security
- **Scalable Architecture**: Designed to handle millions of events

## 📊 Architecture

```
┌─────────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Event Source  │ ───► │  Ingestion   │ ───► │   Raw Events    │
│  (Client Apps)  │      │     API      │      │   (Bronze)      │
└─────────────────┘      └──────────────┘      └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  dbt Transform  │
                                                │   (Staging)     │
                                                └─────────────────┘
                                                         │
                         ┌───────────────────────────────┼───────────────────┐
                         ▼                               ▼                   ▼
                ┌─────────────────┐          ┌─────────────────┐   ┌──────────────┐
                │  Core Warehouse │          │  Metrics Tables │   │  Dimensions  │
                │  (Fact Tables)  │          │   (DAU/MAU)     │   │   (Users)    │
                └─────────────────┘          └─────────────────┘   └──────────────┘
                         │                               │
                         └───────────────┬───────────────┘
                                         ▼
                                ┌─────────────────┐
                                │   Metrics API   │
                                └─────────────────┘
                                         │
                                         ▼
                                ┌─────────────────┐
                                │   Dashboard UI  │
                                │    (Next.js)    │
                                └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **shadcn/ui**: Beautiful, accessible component library
- **Recharts**: Charting library for data visualization

### Backend & Data
- **Supabase**: PostgreSQL database with real-time capabilities
- **dbt**: SQL-based data transformation framework
- **PostgreSQL**: Robust, scalable database

### Infrastructure
- **Vercel**: Deployment and hosting (recommended)
- **pnpm**: Fast, efficient package manager

## 📁 Project Structure

```
.
├── app/                    # Next.js application
│   ├── api/               # API routes
│   │   ├── events/        # Event ingestion & queries
│   │   └── metrics/       # Analytics metrics endpoints
│   ├── dashboard/         # Dashboard pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   └── ui/                # Reusable UI components (shadcn)
├── lib/                   # Utilities and helpers
│   ├── analytics/         # Analytics client & utilities
│   └── supabase/          # Supabase client configuration
├── models/                # dbt models
│   ├── staging/           # Staging layer (cleaned data)
│   ├── marts/
│   │   ├── core/          # Core dimensional models
│   │   └── metrics/       # Pre-aggregated metrics
├── scripts/               # Database setup scripts
├── docs/                  # Documentation
└── dbt_project.yml        # dbt configuration
```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (or Supabase account)
- Python 3.8+ and dbt-core (for data transformations)

### 1. Clone and Install

```bash
git clone https://github.com/johaankjis/Growth-Analytics-Warehouse-for-a-Social-App.git
cd Growth-Analytics-Warehouse-for-a-Social-App
pnpm install
```

### 2. Database Setup

#### Option A: Supabase (Recommended)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL scripts in order from `scripts/` directory:
   ```sql
   -- Run these in Supabase SQL Editor
   001_create_raw_events_table.sql
   002_create_sessions_table.sql
   003_create_users_dim_table.sql
   004_create_metrics_views.sql
   005_create_fact_tables_and_views.sql
   ```

#### Option B: Local PostgreSQL

```bash
# Create database
createdb analytics

# Run setup scripts
psql analytics < scripts/001_create_raw_events_table.sql
psql analytics < scripts/002_create_sessions_table.sql
# ... continue with remaining scripts
```

### 3. Environment Variables

Create a `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Database (for dbt)
POSTGRES_HOST=db.your-project.supabase.co
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DATABASE=postgres
POSTGRES_PORT=5432
```

### 4. Run dbt Models

```bash
# Install dbt
pip install dbt-postgres

# Configure profile (edit profiles.yml if needed)
# Then run transformations
dbt deps
dbt run
dbt test
```

### 5. Start the Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the dashboard!

## 📈 Data Models

### Staging Layer

- **stg_events**: Cleaned and normalized events from raw_events
- **stg_sessions**: Session-level aggregations built from events

### Core Layer (Dimensional Model)

- **dim_users**: User dimension with first/last touch attribution
- **dim_devices**: Device, OS, and browser combinations  
- **dim_geo**: Geography dimension (country, region, city)
- **fact_events**: Event-level facts with dimension keys
- **fact_sessions**: Session-level facts with dimension keys

### Metrics Layer

- **daily_active_users**: DAU with identified/anonymous breakdown
- **weekly_active_users**: WAU metrics
- **monthly_active_users**: MAU metrics
- **retention_cohorts**: User retention by cohort
- **event_funnel**: Conversion funnel analysis

See [docs/METRICS.md](docs/METRICS.md) for detailed metric definitions.

## 🔌 API Endpoints

### Event Ingestion

```typescript
POST /api/events/ingest
Content-Type: application/json

{
  "event_name": "page_view",
  "user_id": "user_123",
  "session_id": "session_456",
  "properties": {
    "page_path": "/dashboard"
  }
}
```

### Analytics Metrics

- `GET /api/metrics/overview` - Summary metrics (DAU, MAU, sessions, bounce rate)
- `GET /api/metrics/dau` - Daily Active Users trend
- `GET /api/metrics/mau` - Monthly Active Users trend
- `GET /api/metrics/wau` - Weekly Active Users trend
- `GET /api/metrics/retention` - Cohort retention analysis
- `GET /api/metrics/funnel` - Conversion funnel data
- `GET /api/metrics/top-events` - Most frequent events
- `GET /api/metrics/top-pages` - Most viewed pages
- `GET /api/metrics/growth` - Growth rate calculations

All endpoints support query parameters for date filtering:
- `start_date` - ISO date (YYYY-MM-DD)
- `end_date` - ISO date (YYYY-MM-DD)
- `limit` - Number of results

## 🎨 Dashboard Features

### Overview Cards
- Total Users
- Daily Active Users (DAU)
- Average Session Duration
- Bounce Rate

### Charts & Visualizations
- **DAU Trend Chart**: 30-day rolling active users
- **Retention Heatmap**: Cohort retention over time
- **Conversion Funnel**: Step-by-step drop-off analysis
- **Top Events Table**: Most tracked events
- **Top Pages Table**: Most visited pages

### Filters
- Date Range Picker: Analyze custom time periods
- Real-time updates with React Suspense

## 🔧 Configuration

### dbt Configuration

Edit `dbt_project.yml` to customize:
- Model materialization strategies
- Schema names
- Model-specific configurations

```yaml
models:
  analytics:
    staging:
      +materialized: view
      +schema: staging
    marts:
      core:
        +materialized: table
      metrics:
        +materialized: table
```

### Next.js Configuration

Edit `next.config.mjs` for deployment settings:
- Image optimization
- Build configuration
- Environment variables

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- AWS Amplify
- Railway
- Self-hosted with Docker

## 📚 Documentation

- [METRICS.md](docs/METRICS.md) - Comprehensive metrics documentation
- [dbt/README.md](dbt/README.md) - dbt-specific documentation
- [API Documentation](#-api-endpoints) - See above

## 🧪 Testing

```bash
# Run dbt tests
dbt test

# Run Next.js lint
pnpm lint

# Build for production
pnpm build
```

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [dbt](https://www.getdbt.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Powered by [Supabase](https://supabase.com/)
- Deployed on [Vercel](https://vercel.com/)

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Check existing documentation
- Review the [METRICS.md](docs/METRICS.md) guide

---

**Built with ❤️ for data-driven product growth**
