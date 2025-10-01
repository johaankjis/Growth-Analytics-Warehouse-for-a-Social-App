import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/metrics/top-events?start_date=2025-01-01&end_date=2025-01-31&limit=10

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const start_date = searchParams.get("start_date")
    const end_date = searchParams.get("end_date")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Query to get top events by count
    let query = supabase.from("fact_events").select("event_name")

    if (start_date) query = query.gte("event_date", start_date)
    if (end_date) query = query.lte("event_date", end_date)

    const { data, error } = await query

    if (error) {
      console.error("[v0] Top events query error:", error)
      return NextResponse.json({ error: "Failed to query top events", details: error.message }, { status: 500 })
    }

    // Aggregate event counts
    const eventCounts = data.reduce(
      (acc, event) => {
        acc[event.event_name] = (acc[event.event_name] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    // Sort and limit
    const topEvents = Object.entries(eventCounts)
      .map(([event_name, count]) => ({ event_name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      metric: "top_events",
      count: topEvents.length,
      data: topEvents,
    })
  } catch (error) {
    console.error("[v0] Top events query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
