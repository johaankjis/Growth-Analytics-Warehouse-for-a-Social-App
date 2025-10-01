// Client-side API wrapper for querying analytics metrics

export interface MetricResponse<T> {
  success: boolean
  metric: string
  count: number
  data: T
}

export interface OverviewMetrics {
  total_events: number
  total_sessions: number
  total_users: number
  latest_dau: number
  latest_mau: number
  avg_session_duration_seconds: number
  bounce_rate: number
  date_range: {
    start_date: string
    end_date: string
  }
}

export interface DAUData {
  event_date: string
  dau: number
  dau_identified: number
  dau_anonymous: number
}

export interface MAUData {
  month_start: string
  mau: number
  mau_identified: number
  mau_anonymous: number
}

export interface WAUData {
  week_start: string
  wau: number
  wau_identified: number
  wau_anonymous: number
}

export interface RetentionData {
  cohort_date: string
  days_since_cohort: number
  cohort_size: number
  retained_users: number
  retention_rate: number
}

export interface FunnelData {
  step_name: string
  step_number: number
  sessions_reached: number
  conversion_rate: number | null
}

export interface TopEventData {
  event_name: string
  count: number
}

export interface TopPageData {
  page_path: string
  views: number
}

class AnalyticsAPIClient {
  private baseUrl = "/api/metrics"

  async getOverview(startDate?: string, endDate?: string): Promise<OverviewMetrics> {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)

    const response = await fetch(`${this.baseUrl}/overview?${params}`)
    const json = await response.json()
    return json.data
  }

  async getDAU(startDate?: string, endDate?: string, limit?: number): Promise<DAUData[]> {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)
    if (limit) params.append("limit", limit.toString())

    const response = await fetch(`${this.baseUrl}/dau?${params}`)
    const json = await response.json()
    return json.data
  }

  async getMAU(startDate?: string, endDate?: string, limit?: number): Promise<MAUData[]> {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)
    if (limit) params.append("limit", limit.toString())

    const response = await fetch(`${this.baseUrl}/mau?${params}`)
    const json = await response.json()
    return json.data
  }

  async getWAU(startDate?: string, endDate?: string, limit?: number): Promise<WAUData[]> {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)
    if (limit) params.append("limit", limit.toString())

    const response = await fetch(`${this.baseUrl}/wau?${params}`)
    const json = await response.json()
    return json.data
  }

  async getRetention(cohortDate?: string, maxDays?: number): Promise<RetentionData[]> {
    const params = new URLSearchParams()
    if (cohortDate) params.append("cohort_date", cohortDate)
    if (maxDays) params.append("max_days", maxDays.toString())

    const response = await fetch(`${this.baseUrl}/retention?${params}`)
    const json = await response.json()
    return json.data
  }

  async getFunnel(): Promise<FunnelData[]> {
    const response = await fetch(`${this.baseUrl}/funnel`)
    const json = await response.json()
    return json.data
  }

  async getTopEvents(startDate?: string, endDate?: string, limit?: number): Promise<TopEventData[]> {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)
    if (limit) params.append("limit", limit.toString())

    const response = await fetch(`${this.baseUrl}/top-events?${params}`)
    const json = await response.json()
    return json.data
  }

  async getTopPages(startDate?: string, endDate?: string, limit?: number): Promise<TopPageData[]> {
    const params = new URLSearchParams()
    if (startDate) params.append("start_date", startDate)
    if (endDate) params.append("end_date", endDate)
    if (limit) params.append("limit", limit.toString())

    const response = await fetch(`${this.baseUrl}/top-pages?${params}`)
    const json = await response.json()
    return json.data
  }
}

// Export singleton instance
export const analyticsAPI = new AnalyticsAPIClient()
