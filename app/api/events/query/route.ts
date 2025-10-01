import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Query endpoint for retrieving events
// GET /api/events/query?start_date=2025-01-01&end_date=2025-01-31&event_name=page_view

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const start_date = searchParams.get("start_date")
    const end_date = searchParams.get("end_date")
    const event_name = searchParams.get("event_name")
    const user_id = searchParams.get("user_id")
    const limit = Number.parseInt(searchParams.get("limit") || "100")

    let query = supabase.from("raw_events").select("*").order("event_timestamp", { ascending: false }).limit(limit)

    if (start_date) {
      query = query.gte("event_timestamp", start_date)
    }

    if (end_date) {
      query = query.lte("event_timestamp", end_date)
    }

    if (event_name) {
      query = query.eq("event_name", event_name)
    }

    if (user_id) {
      query = query.eq("user_id", user_id)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Event query error:", error)
      return NextResponse.json({ error: "Failed to query events", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      count: data.length,
      events: data,
    })
  } catch (error) {
    console.error("[v0] Event query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
