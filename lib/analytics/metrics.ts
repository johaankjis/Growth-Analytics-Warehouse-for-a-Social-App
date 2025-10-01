// Standard analytics metrics calculations and utilities

export interface MetricCalculation {
  value: number
  change?: number
  changePercent?: number
}

/**
 * Calculate DAU/MAU ratio (stickiness)
 * Higher ratio = more engaged users
 */
export function calculateStickiness(dau: number, mau: number): number {
  if (mau === 0) return 0
  return Math.round((dau / mau) * 100 * 100) / 100
}

/**
 * Calculate retention rate for a specific day
 */
export function calculateRetentionRate(cohortSize: number, retainedUsers: number): number {
  if (cohortSize === 0) return 0
  return Math.round((retainedUsers / cohortSize) * 100 * 100) / 100
}

/**
 * Calculate conversion rate between funnel steps
 */
export function calculateConversionRate(previousStep: number, currentStep: number): number {
  if (previousStep === 0) return 0
  return Math.round((currentStep / previousStep) * 100 * 100) / 100
}

/**
 * Calculate average session duration in minutes
 */
export function formatSessionDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}m ${remainingSeconds}s`
}

/**
 * Calculate bounce rate
 */
export function calculateBounceRate(totalSessions: number, bouncedSessions: number): number {
  if (totalSessions === 0) return 0
  return Math.round((bouncedSessions / totalSessions) * 100 * 100) / 100
}

/**
 * Calculate growth rate between two periods
 */
export function calculateGrowthRate(current: number, previous: number): MetricCalculation {
  const change = current - previous
  const changePercent = previous === 0 ? 0 : Math.round((change / previous) * 100 * 100) / 100

  return {
    value: current,
    change,
    changePercent,
  }
}

/**
 * Calculate percentile (e.g., P50, P90, P95)
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0

  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[index]
}

/**
 * Calculate engagement score (0-100)
 * Based on session frequency, duration, and recency
 */
export function calculateEngagementScore(
  sessionCount: number,
  avgSessionDuration: number,
  daysSinceLastSession: number,
): number {
  // Frequency score (0-40 points)
  const frequencyScore = Math.min(sessionCount * 2, 40)

  // Duration score (0-30 points)
  const durationScore = Math.min(avgSessionDuration / 10, 30)

  // Recency score (0-30 points)
  const recencyScore = Math.max(30 - daysSinceLastSession, 0)

  return Math.round(frequencyScore + durationScore + recencyScore)
}

/**
 * Format large numbers with K, M, B suffixes
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Calculate cohort retention curve
 * Returns array of retention rates for each day
 */
export function calculateRetentionCurve(
  cohortData: Array<{ days_since_cohort: number; retention_rate: number }>,
  maxDays = 30,
): number[] {
  const curve = new Array(maxDays + 1).fill(0)

  for (const data of cohortData) {
    if (data.days_since_cohort <= maxDays) {
      curve[data.days_since_cohort] = data.retention_rate
    }
  }

  return curve
}
