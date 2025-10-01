import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// GET /api/metrics/overview?start_date=2025-01-01&end_date=2025-01-31
// Returns a summary of key metrics for the dashboard

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const start_date = searchParams.get("start_date")
    const end_date = searchParams.get("end_date")

    // Get total events
    let eventsQuery = supabase.from("fact_events").select("event_id", { count: "exact", head: true })

    if (start_date) eventsQuery = eventsQuery.gte("event_date", start_date)
    if (end_date) eventsQuery = eventsQuery.lte("event_date", end_date)

    const { count: totalEvents, error: eventsError } = await eventsQuery

    // Get total sessions
    let sessionsQuery = supabase.from("fact_sessions").select("session_id", { count: "exact", head: true })

    if (start_date) sessionsQuery = sessionsQuery.gte("session_date", start_date)
    if (end_date) sessionsQuery = sessionsQuery.lte("session_date", end_date)

    const { count: totalSessions, error: sessionsError } = await sessionsQuery

    // Get total users
    const { count: totalUsers, error: usersError } = await supabase
      .from("dim_users")
      .select("user_key", { count: "exact", head: true })

    // Get latest DAU
    const { data: latestDau, error: dauError } = await supabase
      .from("daily_active_users")
      .select("*")
      .order("event_date", { ascending: false })
      .limit(1)
      .single()

    // Get latest MAU
    const { data: latestMau, error: mauError } = await supabase
      .from("monthly_active_users")
      .select("*")
      .order("month_start", { ascending: false })
      .limit(1)
      .single()

    // Get average session duration
    let avgDurationQuery = supabase.from("fact_sessions").select("session_duration_seconds")

    if (start_date) avgDurationQuery = avgDurationQuery.gte("session_date", start_date)
    if (end_date) avgDurationQuery = avgDurationQuery.lte("session_date", end_date)

    const { data: sessions, error: durationError } = await avgDurationQuery

    const avgSessionDuration =
      sessions && sessions.length > 0
        ? sessions.reduce((sum, s) => sum + (s.session_duration_seconds || 0), 0) / sessions.length
        : 0

    // Get bounce rate
    let bounceQuery = supabase.from("fact_sessions").select("is_bounce")

    if (start_date) bounceQuery = bounceQuery.gte("session_date", start_date)
    if (end_date) bounceQuery = bounceQuery.lte("session_date", end_date)

    const { data: bounceSessions, error: bounceError } = await bounceQuery

    const bounceRate =
      bounceSessions && bounceSessions.length > 0
        ? (bounceSessions.filter((s) => s.is_bounce).length / bounceSessions.length) * 100
        : 0

    if (eventsError || sessionsError || usersError) {
      console.error("[v0] Overview query error:", { eventsError, sessionsError, usersError })
    }

    return NextResponse.json({
      success: true,
      data: {
        total_events: totalEvents || 0,
        total_sessions: totalSessions || 0,
        total_users: totalUsers || 0,
        latest_dau: latestDau?.dau || 0,
        latest_mau: latestMau?.mau || 0,
        avg_session_duration_seconds: Math.round(avgSessionDuration),
        bounce_rate: Math.round(bounceRate * 100) / 100,
        date_range: {
          start_date: start_date || "all_time",
          end_date: end_date || "all_time",
        },
      },
    })
  } catch (error) {
    console.error("[v0] Overview query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
