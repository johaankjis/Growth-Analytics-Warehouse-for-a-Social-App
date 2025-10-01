import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/metrics/mau?start_date=2025-01-01&end_date=2025-12-31

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const start_date = searchParams.get("start_date")
    const end_date = searchParams.get("end_date")
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    let query = supabase
      .from("monthly_active_users")
      .select("*")
      .order("month_start", { ascending: false })
      .limit(limit)

    if (start_date) {
      query = query.gte("month_start", start_date)
    }

    if (end_date) {
      query = query.lte("month_start", end_date)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] MAU query error:", error)
      return NextResponse.json({ error: "Failed to query MAU", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      metric: "monthly_active_users",
      count: data.length,
      data: data,
    })
  } catch (error) {
    console.error("[v0] MAU query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
