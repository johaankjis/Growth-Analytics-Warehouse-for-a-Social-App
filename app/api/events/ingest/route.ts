import { createClient } from "@/lib/supabase/server"
import { type NextRequest, NextResponse } from "next/server"

// Event ingestion endpoint
// POST /api/events/ingest

interface EventPayload {
  event_name: string
  event_timestamp?: string
  user_id?: string
  anonymous_id?: string
  session_id?: string
  properties?: Record<string, any>
  user_properties?: Record<string, any>
  device_type?: string
  device_model?: string
  os_name?: string
  os_version?: string
  browser_name?: string
  browser_version?: string
  country?: string
  region?: string
  city?: string
  page_url?: string
  page_title?: string
  page_path?: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  screen_width?: number
  screen_height?: number
  viewport_width?: number
  viewport_height?: number
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    // Support both single event and batch ingestion
    const events: EventPayload[] = Array.isArray(body) ? body : [body]

    // Validate events
    for (const event of events) {
      if (!event.event_name) {
        return NextResponse.json({ error: "event_name is required" }, { status: 400 })
      }
    }

    // Get IP address and user agent from request
    const ip_address = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown"
    const user_agent = request.headers.get("user-agent") || "unknown"

    // Prepare events for insertion
    const eventsToInsert = events.map((event) => ({
      event_name: event.event_name,
      event_timestamp: event.event_timestamp || new Date().toISOString(),
      user_id: event.user_id || null,
      anonymous_id: event.anonymous_id || null,
      session_id: event.session_id || null,
      properties: event.properties || {},
      user_properties: event.user_properties || {},
      device_type: event.device_type || null,
      device_model: event.device_model || null,
      os_name: event.os_name || null,
      os_version: event.os_version || null,
      browser_name: event.browser_name || null,
      browser_version: event.browser_version || null,
      country: event.country || null,
      region: event.region || null,
      city: event.city || null,
      page_url: event.page_url || null,
      page_title: event.page_title || null,
      page_path: event.page_path || null,
      referrer: event.referrer || null,
      utm_source: event.utm_source || null,
      utm_medium: event.utm_medium || null,
      utm_campaign: event.utm_campaign || null,
      utm_term: event.utm_term || null,
      utm_content: event.utm_content || null,
      ip_address,
      user_agent,
      screen_width: event.screen_width || null,
      screen_height: event.screen_height || null,
      viewport_width: event.viewport_width || null,
      viewport_height: event.viewport_height || null,
    }))

    // Insert events into raw_events table
    const { data, error } = await supabase.from("raw_events").insert(eventsToInsert).select("id")

    if (error) {
      console.error("[v0] Event ingestion error:", error)
      return NextResponse.json({ error: "Failed to ingest events", details: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      events_ingested: data.length,
      event_ids: data.map((e) => e.id),
    })
  } catch (error) {
    console.error("[v0] Event ingestion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/events/ingest",
    methods: ["POST"],
  })
}
