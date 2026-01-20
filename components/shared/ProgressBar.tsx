"use client"

import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number // 0-100
  max?: number
  label?: string
  showPercentage?: boolean
  color?: "blue" | "green" | "yellow" | "red" | "purple"
  size?: "sm" | "md" | "lg"
  className?: string
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  color = "blue",
  size = "md",
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  const colorClasses = {
    blue: "bg-blue-600 dark:bg-blue-500",
    green: "bg-green-600 dark:bg-green-500",
    yellow: "bg-yellow-600 dark:bg-yellow-500",
    red: "bg-red-600 dark:bg-red-500",
    purple: "bg-purple-600 dark:bg-purple-500",
  }

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  }

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            colorClasses[color]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
