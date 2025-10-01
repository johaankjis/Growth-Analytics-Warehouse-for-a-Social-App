"use client"

// Client-side analytics SDK for tracking events

interface TrackEventOptions {
  event_name: string
  properties?: Record<string, any>
  user_id?: string
  user_properties?: Record<string, any>
}

class AnalyticsClient {
  private endpoint = "/api/events/ingest"
  private sessionId: string
  private anonymousId: string

  constructor() {
    // Generate or retrieve session ID
    this.sessionId = this.getOrCreateSessionId()
    this.anonymousId = this.getOrCreateAnonymousId()
  }

  private getOrCreateSessionId(): string {
    const key = "_analytics_session_id"
    let sessionId = sessionStorage.getItem(key)

    if (!sessionId) {
      sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem(key, sessionId)
    }

    return sessionId
  }

  private getOrCreateAnonymousId(): string {
    const key = "_analytics_anonymous_id"
    let anonymousId = localStorage.getItem(key)

    if (!anonymousId) {
      anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem(key, anonymousId)
    }

    return anonymousId
  }

  private getDeviceInfo() {
    const ua = navigator.userAgent

    // Simple device detection
    const isMobile = /Mobile|Android|iPhone/i.test(ua)
    const isTablet = /Tablet|iPad/i.test(ua)

    let device_type = "desktop"
    if (isMobile) device_type = "mobile"
    if (isTablet) device_type = "tablet"

    // Browser detection
    let browser_name = "unknown"
    if (ua.includes("Chrome")) browser_name = "Chrome"
    else if (ua.includes("Safari")) browser_name = "Safari"
    else if (ua.includes("Firefox")) browser_name = "Firefox"
    else if (ua.includes("Edge")) browser_name = "Edge"

    // OS detection
    let os_name = "unknown"
    if (ua.includes("Windows")) os_name = "Windows"
    else if (ua.includes("Mac")) os_name = "macOS"
    else if (ua.includes("Linux")) os_name = "Linux"
    else if (ua.includes("Android")) os_name = "Android"
    else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) os_name = "iOS"

    return {
      device_type,
      browser_name,
      os_name,
      screen_width: window.screen.width,
      screen_height: window.screen.height,
      viewport_width: window.innerWidth,
      viewport_height: window.innerHeight,
    }
  }

  private getPageContext() {
    return {
      page_url: window.location.href,
      page_title: document.title,
      page_path: window.location.pathname,
      referrer: document.referrer || null,
    }
  }

  private getUtmParams() {
    const params = new URLSearchParams(window.location.search)
    return {
      utm_source: params.get("utm_source") || undefined,
      utm_medium: params.get("utm_medium") || undefined,
      utm_campaign: params.get("utm_campaign") || undefined,
      utm_term: params.get("utm_term") || undefined,
      utm_content: params.get("utm_content") || undefined,
    }
  }

  async track(options: TrackEventOptions): Promise<void> {
    const payload = {
      event_name: options.event_name,
      event_timestamp: new Date().toISOString(),
      user_id: options.user_id,
      anonymous_id: this.anonymousId,
      session_id: this.sessionId,
      properties: options.properties || {},
      user_properties: options.user_properties || {},
      ...this.getDeviceInfo(),
      ...this.getPageContext(),
      ...this.getUtmParams(),
    }

    try {
      await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error("[v0] Analytics tracking error:", error)
    }
  }

  // Convenience methods
  async pageView(user_id?: string): Promise<void> {
    await this.track({
      event_name: "page_view",
      user_id,
    })
  }

  async click(element: string, user_id?: string, properties?: Record<string, any>): Promise<void> {
    await this.track({
      event_name: "click",
      user_id,
      properties: {
        element,
        ...properties,
      },
    })
  }

  async formSubmit(form_name: string, user_id?: string, properties?: Record<string, any>): Promise<void> {
    await this.track({
      event_name: "form_submit",
      user_id,
      properties: {
        form_name,
        ...properties,
      },
    })
  }
}

// Export singleton instance
export const analytics = new AnalyticsClient()
