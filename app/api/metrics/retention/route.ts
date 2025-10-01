import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/metrics/retention?cohort_date=2025-01-01&max_days=30

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const cohort_date = searchParams.get("cohort_date")
    const max_days = Number.parseInt(searchParams.get("max_days") || "30")
    const limit = Number.parseInt(searchParams.get("limit") || "1000")

    let query = supabase
      .from("retention_cohorts")
      .select("*")
      .order("cohort_date", { ascending: false })
      .order("days_since_cohort", { ascending: true })
      .limit(limit)

    if (cohort_date) {
      query = query.eq("cohort_date", cohort_date)
    }

    if (max_days) {
      query = query.lte("days_since_cohort", max_days)
    }

    const { data, error } = await query

    if (error) {
      console.error("[v0] Retention query error:", error)
      return NextResponse.json({ error: "Failed to query retention", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      metric: "retention_cohorts",
      count: data.length,
      data: data,
    })
  } catch (error) {
    console.error("[v0] Retention query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
