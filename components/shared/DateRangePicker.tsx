"use client"

import { useState } from "react"
import { Calendar, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onDateChange?: (start: string, end: string) => void
  className?: string
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  className,
}: DateRangePickerProps) {
  const [localStartDate, setLocalStartDate] = useState(startDate || "")
  const [localEndDate, setLocalEndDate] = useState(endDate || "")

  const handleStartDateChange = (value: string) => {
    setLocalStartDate(value)
    if (onDateChange) {
      onDateChange(value, localEndDate)
    }
  }

  const handleEndDateChange = (value: string) => {
    setLocalEndDate(value)
    if (onDateChange) {
      onDateChange(localStartDate, value)
    }
  }

  const handleClear = () => {
    setLocalStartDate("")
    setLocalEndDate("")
    if (onDateChange) {
      onDateChange("", "")
    }
  }

  const hasDates = localStartDate || localEndDate

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="date"
          value={localStartDate}
          onChange={(e) => handleStartDateChange(e.target.value)}
          placeholder="Start Date"
          className="pl-10"
        />
      </div>
      <span className="text-gray-400">to</span>
      <div className="relative flex-1">
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="date"
          value={localEndDate}
          onChange={(e) => handleEndDateChange(e.target.value)}
          placeholder="End Date"
          className="pl-10"
        />
      </div>
      {hasDates && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClear}
          className="h-10 w-10"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
