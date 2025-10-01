import { Suspense } from "react"
import { OverviewCards } from "@/components/dashboard/overview-cards"
import { DAUChart } from "@/components/dashboard/dau-chart"
import { RetentionChart } from "@/components/dashboard/retention-chart"
import { FunnelChart } from "@/components/dashboard/funnel-chart"
import { TopEventsTable } from "@/components/dashboard/top-events-table"
import { TopPagesTable } from "@/components/dashboard/top-pages-table"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">A</span>
            </div>
            <h1 className="text-xl font-semibold text-foreground">Analytics Dashboard</h1>
          </div>
          <DateRangePicker />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-muted/30 p-4 md:p-6 lg:p-8">
        <div className="container mx-auto space-y-6">
          {/* Overview Cards */}
          <Suspense fallback={<OverviewSkeleton />}>
            <OverviewCards />
          </Suspense>

          {/* Charts Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Suspense fallback={<ChartSkeleton />}>
              <DAUChart />
            </Suspense>

            <Suspense fallback={<ChartSkeleton />}>
              <FunnelChart />
            </Suspense>
          </div>

          {/* Retention Chart */}
          <Suspense fallback={<ChartSkeleton />}>
            <RetentionChart />
          </Suspense>

          {/* Tables Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Suspense fallback={<TableSkeleton />}>
              <TopEventsTable />
            </Suspense>

            <Suspense fallback={<TableSkeleton />}>
              <TopPagesTable />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full" />
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[200px] w-full" />
      </CardContent>
    </Card>
  )
}
