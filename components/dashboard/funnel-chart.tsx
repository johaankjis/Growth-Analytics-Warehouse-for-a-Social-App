"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { useEffect, useState } from "react"
import { analyticsAPI, type FunnelData } from "@/lib/analytics/api-client"

export function FunnelChart() {
  const [data, setData] = useState<FunnelData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await analyticsAPI.getFunnel()
        setData(result || [])
        setError(null)
      } catch (error) {
        console.error("[v0] Failed to fetch funnel data:", error)
        setError("Failed to load funnel data")
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
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey through key events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey through key events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
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
          <CardTitle>Conversion Funnel</CardTitle>
          <CardDescription>User journey through key events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <p className="text-sm">No funnel data available yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
        <CardDescription>User journey through key events</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            sessions: {
              label: "Sessions",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="step_name" className="text-xs text-muted-foreground" />
              <YAxis className="text-xs text-muted-foreground" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sessions_reached" fill="var(--color-sessions)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 space-y-2">
          {data.map((step, index) => (
            <div key={step.step_name} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {index + 1}. {step.step_name}
              </span>
              <div className="flex items-center gap-4">
                <span className="font-medium text-foreground">{step.sessions_reached.toLocaleString()} sessions</span>
                {step.conversion_rate !== null && (
                  <span className="text-xs text-muted-foreground">{step.conversion_rate}% conversion</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
