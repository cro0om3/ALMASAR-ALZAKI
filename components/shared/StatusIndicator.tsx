"use client"

import { cn } from "@/lib/utils"

interface StatusIndicatorProps {
  status: "online" | "offline" | "away" | "busy"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function StatusIndicator({
  status,
  size = "md",
  className,
}: StatusIndicatorProps) {
  const sizeClasses = {
    sm: "h-2 w-2",
    md: "h-3 w-3",
    lg: "h-4 w-4",
  }

  const statusClasses = {
    online: "bg-green-500 animate-pulse",
    offline: "bg-gray-400",
    away: "bg-yellow-500",
    busy: "bg-red-500",
  }

  return (
    <span
      className={cn(
        "inline-block rounded-full border-2 border-white dark:border-blue-900",
        sizeClasses[size],
        statusClasses[status],
        className
      )}
      title={status}
    />
  )
}
