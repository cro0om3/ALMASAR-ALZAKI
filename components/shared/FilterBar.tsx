"use client"

import { useState } from "react"
import { Search, Filter, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface FilterOption {
  label: string
  value: string
}

export interface FilterConfig {
  key: string
  label: string
  options: FilterOption[]
  placeholder?: string
}

interface FilterBarProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  filters?: FilterConfig[]
  filterValues?: Record<string, string>
  onFilterChange?: (key: string, value: string) => void
  onClearFilters?: () => void
  className?: string
}

export function FilterBar({
  searchPlaceholder = "Search...",
  searchValue = "",
  onSearchChange,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  className,
}: FilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchValue)
  const hasActiveFilters = Object.values(filterValues).some((v) => v && v !== "all")

  const handleSearchChange = (value: string) => {
    setLocalSearch(value)
    onSearchChange?.(value)
  }

  const handleFilterChange = (key: string, value: string) => {
    onFilterChange?.(key, value)
  }

  const handleClearAll = () => {
    setLocalSearch("")
    onSearchChange?.("")
    onClearFilters?.()
  }

  return (
    <div className={cn("space-y-4 p-4 bg-white dark:bg-blue-900/30 rounded-lg border border-gray-200 dark:border-gray-800", className)}>
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-600"
          />
        </div>

        {/* Filters */}
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filterValues[filter.key] || "all"}
            onValueChange={(value) => handleFilterChange(filter.key, value)}
          >
            <SelectTrigger className="w-full md:w-[180px] border-2 border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <SelectValue placeholder={filter.placeholder || filter.label} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearAll}
            className="border-2 border-gray-300 dark:border-gray-700"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filterValues).map(([key, value]) => {
            if (!value || value === "all") return null
            const filter = filters.find((f) => f.key === key)
            const option = filter?.options.find((o) => o.value === value)
            if (!filter || !option) return null

            return (
              <Badge
                key={key}
                variant="secondary"
                className="flex items-center gap-1 px-3 py-1"
              >
                <span className="font-semibold">{filter.label}:</span>
                <span>{option.label}</span>
                <button
                  onClick={() => handleFilterChange(key, "all")}
                  className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )
          })}
        </div>
      )}
    </div>
  )
}
