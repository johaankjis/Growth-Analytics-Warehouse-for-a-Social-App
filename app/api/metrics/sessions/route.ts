import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/metrics/sessions?start_date=2025-01-01&end_date=2025-01-31&aggregate_by=day

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const start_date = searchParams.get("start_date")
    const end_date = searchParams.get("end_date")
    const aggregate_by = searchParams.get("aggregate_by") || "day" // day, week, month

    // Build aggregation query based on aggregate_by parameter
    const dateColumn = "session_date"
    let dateTrunc = "session_date"

    if (aggregate_by === "week") {
      dateTrunc = "DATE_TRUNC('week', session_start)::DATE"
    } else if (aggregate_by === "month") {
      dateTrunc = "DATE_TRUNC('month', session_start)::DATE"
    }

    // Use RPC for complex aggregation
    const { data, error } = await supabase.rpc("get_session_metrics", {
      p_start_date: start_date,
      p_end_date: end_date,
      p_aggregate_by: aggregate_by,
    })

    if (error) {
      // Fallback to simple query if RPC doesn't exist
      let query = supabase.from("fact_sessions").select("*").order("session_date", { ascending: false }).limit(1000)

      if (start_date) {
        query = query.gte("session_date", start_date)
      }

      if (end_date) {
        query = query.lte("session_date", end_date)
      }

      const { data: fallbackData, error: fallbackError } = await query

      if (fallbackError) {
        console.error("[v0] Session query error:", fallbackError)
        return NextResponse.json({ error: "Failed to query sessions", details: fallbackError.message }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        metric: "sessions",
        count: fallbackData.length,
        data: fallbackData,
      })
    }

    return NextResponse.json({
      success: true,
      metric: "sessions",
      count: data.length,
      data: data,
    })
  } catch (error) {
    console.error("[v0] Session query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
