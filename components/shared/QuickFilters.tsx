"use client"

import { Button } from "@/components/ui/button"
import { Calendar, Filter } from "lucide-react"
import { useState } from "react"

interface QuickFilter {
  label: string
  value: string
  onClick: () => void
}

interface QuickFiltersProps {
  filters: QuickFilter[]
  activeFilter?: string
  className?: string
}

export function QuickFilters({ filters, activeFilter, className }: QuickFiltersProps) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? "default" : "outline"}
          size="sm"
          onClick={filter.onClick}
          className={
            activeFilter === filter.value
              ? "bg-blue-600 hover:bg-blue-700 text-white"
              : "border-2 border-blue-400 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900"
          }
        >
          <Filter className="mr-2 h-3 w-3" />
          {filter.label}
        </Button>
      ))}
    </div>
  )
}
