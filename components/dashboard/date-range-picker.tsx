"use client"

import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export function DateRangePicker() {
  return (
    <Button variant="outline" className="gap-2 bg-transparent">
      <Calendar className="h-4 w-4" />
      <span className="hidden sm:inline">Last 30 days</span>
    </Button>
  )
}
