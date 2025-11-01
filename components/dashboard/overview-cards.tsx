import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { analyticsAPI } from "@/lib/analytics/api-client"
import { ArrowUpIcon, ArrowDownIcon, Users, Activity, Clock, TrendingUp } from "lucide-react"

export async function OverviewCards() {
  let overview
  try {
    overview = await analyticsAPI.getOverview()
  } catch (error) {
    console.error("[] Failed to fetch overview:", error)
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {["Total Users", "Daily Active Users", "Avg Session Duration", "Bounce Rate"].map((title) => (
          <Card key={title} className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-card-foreground">-</div>
              <p className="text-xs text-muted-foreground mt-1">No data available</p>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const cards = [
    {
      title: "Total Users",
      value: overview.total_users.toLocaleString(),
      icon: Users,
      trend: null,
    },
    {
      title: "Daily Active Users",
      value: overview.latest_dau.toLocaleString(),
      icon: Activity,
      trend: null,
    },
    {
      title: "Avg Session Duration",
      value: `${Math.floor(overview.avg_session_duration_seconds / 60)}m ${overview.avg_session_duration_seconds % 60}s`,
      icon: Clock,
      trend: null,
    },
    {
      title: "Bounce Rate",
      value: `${overview.bounce_rate}%`,
      icon: TrendingUp,
      trend: overview.bounce_rate < 50 ? "up" : "down",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card key={card.title} className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-bold text-card-foreground">{card.value}</div>
                {card.trend && (
                  <div
                    className={`flex items-center text-xs font-medium ${
                      card.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {card.trend === "up" ? <ArrowUpIcon className="h-3 w-3" /> : <ArrowDownIcon className="h-3 w-3" />}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
