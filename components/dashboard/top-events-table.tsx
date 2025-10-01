"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { analyticsAPI, type TopEventData } from "@/lib/analytics/api-client"

export function TopEventsTable() {
  const [data, setData] = useState<TopEventData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await analyticsAPI.getTopEvents(undefined, undefined, 10)
        setData(result || [])
        setError(null)
      } catch (error) {
        console.error("[v0] Failed to fetch top events:", error)
        setError("Failed to load top events")
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
          <CardTitle>Top Events</CardTitle>
          <CardDescription>Most tracked events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] animate-pulse bg-muted rounded" />
        </CardContent>
      </Card>
    )
  }

  if (error || !data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Events</CardTitle>
          <CardDescription>Most tracked events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <p className="text-sm">{error || "No events tracked yet"}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Events</CardTitle>
        <CardDescription>Most tracked events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((event, index) => (
            <div
              key={event.event_name}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {index + 1}
                </div>
                <span className="font-medium text-foreground">{event.event_name}</span>
              </div>
              <span className="text-sm text-muted-foreground">{event.count.toLocaleString()} events</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
