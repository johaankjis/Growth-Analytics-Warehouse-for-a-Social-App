import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/metrics/top-pages?start_date=2025-01-01&end_date=2025-01-31&limit=10

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const start_date = searchParams.get("start_date")
    const end_date = searchParams.get("end_date")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Query to get page views
    let query = supabase.from("fact_events").select("page_path").eq("event_name", "page_view")

    if (start_date) query = query.gte("event_date", start_date)
    if (end_date) query = query.lte("event_date", end_date)

    const { data, error } = await query

    if (error) {
      console.error("[v0] Top pages query error:", error)
      return NextResponse.json({ error: "Failed to query top pages", details: error.message }, { status: 500 })
    }

    // Aggregate page counts
    const pageCounts = data
      .filter((event) => event.page_path)
      .reduce(
        (acc, event) => {
          acc[event.page_path] = (acc[event.page_path] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    // Sort and limit
    const topPages = Object.entries(pageCounts)
      .map(([page_path, views]) => ({ page_path, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      metric: "top_pages",
      count: topPages.length,
      data: topPages,
    })
  } catch (error) {
    console.error("[v0] Top pages query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
