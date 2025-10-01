import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"
import { calculateGrowthRate } from "@/lib/analytics/metrics"

// GET /api/metrics/growth?metric=dau&current_date=2025-01-31&previous_date=2025-01-30
// Calculate growth rate for any metric

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const metric = searchParams.get("metric") || "dau"
    const currentDate = searchParams.get("current_date")
    const previousDate = searchParams.get("previous_date")

    if (!currentDate || !previousDate) {
      return NextResponse.json({ error: "current_date and previous_date are required" }, { status: 400 })
    }

    let tableName = "daily_active_users"
    let valueColumn = "dau"
    let dateColumn = "event_date"

    // Map metric to table and column
    if (metric === "mau") {
      tableName = "monthly_active_users"
      valueColumn = "mau"
      dateColumn = "month_start"
    } else if (metric === "wau") {
      tableName = "weekly_active_users"
      valueColumn = "wau"
      dateColumn = "week_start"
    }

    // Get current value
    const { data: currentData, error: currentError } = await supabase
      .from(tableName)
      .select(valueColumn)
      .eq(dateColumn, currentDate)
      .single()

    // Get previous value
    const { data: previousData, error: previousError } = await supabase
      .from(tableName)
      .select(valueColumn)
      .eq(dateColumn, previousDate)
      .single()

    if (currentError || previousError) {
      console.error("[v0] Growth query error:", { currentError, previousError })
      return NextResponse.json({ error: "Failed to calculate growth" }, { status: 500 })
    }

    const currentValue = currentData?.[valueColumn] || 0
    const previousValue = previousData?.[valueColumn] || 0

    const growth = calculateGrowthRate(currentValue, previousValue)

    return NextResponse.json({
      success: true,
      metric: "growth",
      data: {
        metric,
        current_date: currentDate,
        previous_date: previousDate,
        current_value: currentValue,
        previous_value: previousValue,
        change: growth.change,
        change_percent: growth.changePercent,
      },
    })
  } catch (error) {
    console.error("[v0] Growth query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
