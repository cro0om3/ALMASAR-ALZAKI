"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { AnimatedCard } from "./AnimatedCard"

interface StatItem {
  title: string
  value: string | number
  icon?: LucideIcon
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  color?: "blue" | "green" | "orange" | "red" | "purple" | "gold"
}

interface StatsGridProps {
  stats: StatItem[]
  columns?: 2 | 3 | 4
  className?: string
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-2 lg:grid-cols-4",
  }

  const colorClasses = {
    blue: "border-blue-200/60 dark:border-blue-800/60 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-blue-900/30",
    green: "border-green-200/60 dark:border-green-800/60 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-blue-900/30",
    orange: "border-orange-200/60 dark:border-orange-800/60 bg-gradient-to-br from-orange-50 to-white dark:from-orange-900/20 dark:to-blue-900/30",
    red: "border-red-200/60 dark:border-red-800/60 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-blue-900/30",
    purple: "border-purple-200/60 dark:border-purple-800/60 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-blue-900/30",
    gold: "border-gold/60 dark:border-gold/40 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-900/20 dark:to-blue-900/30",
  }

  const iconColors = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    orange: "text-orange-600 dark:text-orange-400",
    red: "text-red-600 dark:text-red-400",
    purple: "text-purple-600 dark:text-purple-400",
    gold: "text-yellow-600 dark:text-yellow-400",
  }

  return (
    <div className={cn("grid gap-6", gridCols[columns], className)}>
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const color = stat.color || "blue"
        return (
          <AnimatedCard
            key={index}
            delay={index * 100}
            className={cn("hover-lift", colorClasses[color])}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {stat.title}
              </CardTitle>
              {Icon && (
                <div className={cn("p-2 rounded-lg bg-white/50 dark:bg-blue-900/50", iconColors[color])}>
                  <Icon className="h-4 w-4" />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                {stat.value}
              </div>
              {stat.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {stat.description}
                </p>
              )}
              {stat.trend && (
                <div className={cn(
                  "text-xs font-medium mt-2",
                  stat.trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}>
                  {stat.trend.isPositive ? "↑" : "↓"} {Math.abs(stat.trend.value)}%
                </div>
              )}
            </CardContent>
          </AnimatedCard>
        )
      })}
    </div>
  )
}
