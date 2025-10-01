"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { analyticsAPI, type RetentionData } from "@/lib/analytics/api-client"

export function RetentionChart() {
  const [data, setData] = useState<RetentionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await analyticsAPI.getRetention(undefined, 30)
        setData(result || [])
        setError(null)
      } catch (error) {
        console.error("[v0] Failed to fetch retention data:", error)
        setError("Failed to load retention data")
        setData([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Retention Cohorts</CardTitle>
          <CardDescription>User retention by cohort over 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Retention Cohorts</CardTitle>
          <CardDescription>User retention by cohort over 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">{error}</p>
              <p className="text-xs mt-2">Please ensure the database views are created</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Retention Cohorts</CardTitle>
          <CardDescription>User retention by cohort over 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No retention data available yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group data by cohort
  const cohorts = data.reduce(
    (acc, row) => {
      if (!acc[row.cohort_date]) {
        acc[row.cohort_date] = []
      }
      acc[row.cohort_date].push(row)
      return acc
    },
    {} as Record<string, RetentionData[]>,
  )

  const cohortDates = Object.keys(cohorts).slice(0, 10) // Show last 10 cohorts

  return (
    <Card>
      <CardHeader>
        <CardTitle>Retention Cohorts</CardTitle>
        <CardDescription>User retention by cohort over 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="p-2 text-left font-medium text-muted-foreground">Cohort</th>
                <th className="p-2 text-center font-medium text-muted-foreground">Size</th>
                {Array.from({ length: 8 }).map((_, i) => (
                  <th key={i} className="p-2 text-center font-medium text-muted-foreground">
                    Day {i}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cohortDates.map((cohortDate) => {
                const cohortData = cohorts[cohortDate]
                const cohortSize = cohortData[0]?.cohort_size || 0

                return (
                  <tr key={cohortDate} className="border-b border-border">
                    <td className="p-2 font-medium text-foreground">
                      {new Date(cohortDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </td>
                    <td className="p-2 text-center text-muted-foreground">{cohortSize}</td>
                    {Array.from({ length: 8 }).map((_, dayIndex) => {
                      const dayData = cohortData.find((d) => d.days_since_cohort === dayIndex)
                      const rate = dayData?.retention_rate || 0

                      return (
                        <td key={dayIndex} className="p-2 text-center">
                          <div
                            className="rounded px-2 py-1 text-xs font-medium"
                            style={{
                              backgroundColor: `rgba(139, 92, 246, ${rate / 100})`,
                              color: rate > 50 ? "white" : "inherit",
                            }}
                          >
                            {rate > 0 ? `${rate}%` : "-"}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
