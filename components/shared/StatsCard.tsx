"use client"

import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatsCardProps {
  title: string
  value: string | number
  icon?: ReactNode
  change?: {
    value: number
    label: string
    isPositive?: boolean
  }
  description?: string
  color?: "blue" | "green" | "yellow" | "red" | "purple"
  className?: string
}

export function StatsCard({
  title,
  value,
  icon,
  change,
  description,
  color = "blue",
  className,
}: StatsCardProps) {
  const colorClasses = {
    blue: {
      bg: "bg-blue-100 dark:bg-blue-900",
      text: "text-blue-600 dark:text-blue-400",
      border: "border-blue-200 dark:border-blue-800",
      gradient: "from-blue-500 to-blue-600",
    },
    green: {
      bg: "bg-green-100 dark:bg-green-900",
      text: "text-green-600 dark:text-green-400",
      border: "border-green-200 dark:border-green-800",
      gradient: "from-green-500 to-green-600",
    },
    yellow: {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      text: "text-yellow-600 dark:text-yellow-400",
      border: "border-yellow-200 dark:border-yellow-800",
      gradient: "from-yellow-500 to-yellow-600",
    },
    red: {
      bg: "bg-red-100 dark:bg-red-900",
      text: "text-red-600 dark:text-red-400",
      border: "border-red-200 dark:border-red-800",
      gradient: "from-red-500 to-red-600",
    },
    purple: {
      bg: "bg-purple-100 dark:bg-purple-900",
      text: "text-purple-600 dark:text-purple-400",
      border: "border-purple-200 dark:border-purple-800",
      gradient: "from-purple-500 to-purple-600",
    },
  }

  const colors = colorClasses[color]
  const isPositive = change?.isPositive !== false && (change?.value ?? 0) > 0

  return (
    <Card className={cn("border-2", colors.border, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
        {icon && (
          <div className={cn("p-2 rounded-lg", colors.bg)}>
            <div className={colors.text}>{icon}</div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          {value}
        </div>
        {change && (
          <div className="flex items-center gap-1 text-xs">
            {change.value !== undefined && change.value !== 0 ? (
              <>
                {isPositive ? (
                  <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                )}
                <span
                  className={cn(
                    "font-medium",
                    isPositive
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {Math.abs(change.value)}%
                </span>
              </>
            ) : (
              <>
                <Minus className="h-3 w-3 text-gray-400" />
                <span className="text-gray-400">0%</span>
              </>
            )}
            <span className="text-gray-500 dark:text-gray-400">{change.label}</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}
