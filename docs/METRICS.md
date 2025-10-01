# Analytics Metrics Documentation

This document describes all standard metrics available in the analytics platform.

## Core Metrics

### Daily Active Users (DAU)
- **Definition**: Number of unique users who performed at least one event on a given day
- **Table**: `daily_active_users`
- **API**: `/api/metrics/dau`
- **Use Case**: Track daily engagement trends

### Weekly Active Users (WAU)
- **Definition**: Number of unique users who performed at least one event in a given week
- **Table**: `weekly_active_users`
- **API**: `/api/metrics/wau`
- **Use Case**: Track weekly engagement trends

### Monthly Active Users (MAU)
- **Definition**: Number of unique users who performed at least one event in a given month
- **Table**: `monthly_active_users`
- **API**: `/api/metrics/mau`
- **Use Case**: Track monthly engagement trends

### Stickiness (DAU/MAU Ratio)
- **Definition**: Percentage of monthly active users who are active on a given day
- **Formula**: `(DAU / MAU) * 100`
- **API**: `/api/metrics/stickiness`
- **Benchmark**: 20%+ is considered good for most products
- **Use Case**: Measure user engagement quality

## Session Metrics

### Average Session Duration
- **Definition**: Average time users spend in a session
- **Formula**: `SUM(session_duration_seconds) / COUNT(sessions)`
- **API**: `/api/metrics/sessions`
- **Use Case**: Understand user engagement depth

### Bounce Rate
- **Definition**: Percentage of sessions with only one event or page view
- **Formula**: `(bounced_sessions / total_sessions) * 100`
- **API**: `/api/metrics/overview`
- **Benchmark**: <40% is considered good
- **Use Case**: Identify content or UX issues

### Sessions per User
- **Definition**: Average number of sessions per user
- **Formula**: `total_sessions / unique_users`
- **Use Case**: Measure user return frequency

## Retention Metrics

### Cohort Retention
- **Definition**: Percentage of users from a cohort who return on day N
- **Formula**: `(users_active_on_day_N / cohort_size) * 100`
- **Table**: `retention_cohorts`
- **API**: `/api/metrics/retention`
- **Use Case**: Measure product stickiness over time

### Day 1 Retention
- **Definition**: Percentage of users who return the day after signup
- **Benchmark**: 40%+ is considered good
- **Use Case**: Measure initial product value

### Day 7 Retention
- **Definition**: Percentage of users who return 7 days after signup
- **Benchmark**: 20%+ is considered good
- **Use Case**: Measure medium-term engagement

### Day 30 Retention
- **Definition**: Percentage of users who return 30 days after signup
- **Benchmark**: 10%+ is considered good
- **Use Case**: Measure long-term product fit

## Conversion Metrics

### Conversion Funnel
- **Definition**: Step-by-step conversion rates through a user journey
- **Table**: `event_funnel`
- **API**: `/api/metrics/funnel`
- **Use Case**: Identify drop-off points in user flows

### Conversion Rate
- **Definition**: Percentage of users who complete a desired action
- **Formula**: `(conversions / total_users) * 100`
- **Use Case**: Measure goal achievement

## Growth Metrics

### User Growth Rate
- **Definition**: Percentage change in users over a time period
- **Formula**: `((current_users - previous_users) / previous_users) * 100`
- **API**: `/api/metrics/growth`
- **Use Case**: Track user base expansion

### Event Growth Rate
- **Definition**: Percentage change in events over a time period
- **Use Case**: Track overall platform activity

## Engagement Metrics

### Engagement Score
- **Definition**: Composite score (0-100) based on frequency, duration, and recency
- **Components**:
  - Frequency: Number of sessions (0-40 points)
  - Duration: Average session length (0-30 points)
  - Recency: Days since last session (0-30 points)
- **View**: `user_engagement_scores`
- **Use Case**: Segment users by engagement level

### Events per Session
- **Definition**: Average number of events per session
- **Formula**: `total_events / total_sessions`
- **Use Case**: Measure session depth

### Page Views per Session
- **Definition**: Average number of page views per session
- **Formula**: `total_page_views / total_sessions`
- **Use Case**: Measure content consumption

## Traffic Metrics

### Top Events
- **Definition**: Most frequently tracked events
- **API**: `/api/metrics/top-events`
- **Use Case**: Understand user behavior patterns

### Top Pages
- **Definition**: Most viewed pages
- **API**: `/api/metrics/top-pages`
- **Use Case**: Identify popular content

### Traffic Sources
- **Definition**: Breakdown of users by acquisition channel
- **View**: `traffic_sources`
- **Dimensions**: UTM source, medium, campaign
- **Use Case**: Measure marketing effectiveness

## Device & Geographic Metrics

### Device Breakdown
- **Definition**: Users by device type, OS, and browser
- **View**: `device_metrics`
- **Use Case**: Optimize for user platforms

### Geographic Distribution
- **Definition**: Users by country, region, and city
- **View**: `geo_metrics`
- **Use Case**: Understand user geography

## Metric Calculation Best Practices

1. **Use appropriate time windows**: DAU for daily trends, MAU for monthly planning
2. **Compare cohorts**: Look at retention curves across different cohorts
3. **Segment metrics**: Break down by device, geography, or user properties
4. **Track trends**: Monitor week-over-week and month-over-month changes
5. **Set benchmarks**: Compare against industry standards and your own historical data

## API Usage Examples

\`\`\`typescript
// Get DAU for last 30 days
const dau = await analyticsAPI.getDAU(undefined, undefined, 30)

// Get retention for a specific cohort
const retention = await analyticsAPI.getRetention('2025-01-01', 30)

// Get conversion funnel
const funnel = await analyticsAPI.getFunnel()

// Get overview metrics
const overview = await analyticsAPI.getOverview('2025-01-01', '2025-01-31')
\`\`\`
