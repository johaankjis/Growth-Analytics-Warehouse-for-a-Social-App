import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/metrics/funnel

export async function GET() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase.from("event_funnel").select("*").order("step_number", { ascending: true })

    if (error) {
      console.error("[v0] Funnel query error:", error)
      return NextResponse.json({ error: "Failed to query funnel", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      metric: "event_funnel",
      count: data.length,
      data: data,
    })
  } catch (error) {
    console.error("[v0] Funnel query error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
