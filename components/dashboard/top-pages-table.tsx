"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { analyticsAPI, type TopPageData } from "@/lib/analytics/api-client"

export function TopPagesTable() {
  const [data, setData] = useState<TopPageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await analyticsAPI.getTopPages(undefined, undefined, 10)
        setData(result || [])
        setError(null)
      } catch (error) {
        console.error("[v0] Failed to fetch top pages:", error)
        setError("Failed to load top pages")
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
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>Most viewed pages</CardDescription>
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
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>Most viewed pages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            <p className="text-sm">{error || "No page views tracked yet"}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Pages</CardTitle>
        <CardDescription>Most viewed pages</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {data.map((page, index) => (
            <div key={page.page_path} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-sm font-medium text-accent">
                  {index + 1}
                </div>
                <span className="font-medium text-foreground">{page.page_path}</span>
              </div>
              <span className="text-sm text-muted-foreground">{page.views.toLocaleString()} views</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
