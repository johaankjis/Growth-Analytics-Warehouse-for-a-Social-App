import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { calculateStickiness } from "@/lib/analytics/metrics"

// GET /api/metrics/stickiness?date=2025-01-31
// Calculate DAU/MAU ratio (stickiness metric)

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]

    // Get DAU for the date
    const { data: dauData, error: dauError } = await supabase
      .from("daily_active_users")
      .select("dau")
      .eq("event_date", date)
      .single()

    // Get MAU for the month containing the date
    const monthStart = new Date(date)
    monthStart.setDate(1)
    const monthStartStr = monthStart.toISOString().split("T")[0]

    const { data: mauData, error: mauError } = await supabase
      .from("monthly_active_users")
      .select("mau")
      .eq("month_start", monthStartStr)
      .single()

    if (dauError || mauError) {
      console.error("[v0] Stickiness query error:", { dauError, mauError })
      return NextResponse.json({ error: "Failed to calculate stickiness" }, { status: 500 })
    }

    const dau = dauData?.dau || 0
    const mau = mauData?.mau || 0
    const stickiness = calculateStickiness(dau, mau)

    return NextResponse.json({
      success: true,
      metric: "stickiness",
      data: {
        date,
        dau,
        mau,
        stickiness_percent: stickiness,
      },
    })
  } catch (error) {
    console.error("[v0] Stickiness query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
