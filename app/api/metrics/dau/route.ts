import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/metrics/dau?start_date=2025-01-01&end_date=2025-01-31

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const start_date = searchParams.get("start_date")
    const end_date = searchParams.get("end_date")
    const limit = Number.parseInt(searchParams.get("limit") || "30")

    let query = supabase.from("daily_active_users").select("*").order("event_date", { ascending: false }).limit(limit)

    if (start_date) {
      query = query.gte("event_date", start_date)
    }

    if (end_date) {
      query = query.lte("event_date", end_date)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] DAU query error:", error)
      return NextResponse.json({ error: "Failed to query DAU", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      metric: "daily_active_users",
      count: data.length,
      data: data,
    })
  } catch (error) {
    console.error("[v0] DAU query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
