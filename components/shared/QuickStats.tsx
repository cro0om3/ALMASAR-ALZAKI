"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface Stat {
  label: string
  value: number | string
  previousValue?: number | string
  format?: 'currency' | 'number' | 'percentage'
  trend?: 'up' | 'down' | 'neutral'
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  icon?: React.ReactNode
}

interface QuickStatsProps {
  stats: Stat[]
  columns?: 2 | 3 | 4
  title?: string
}

export function QuickStats({
  stats,
  columns = 4,
  title,
}: QuickStatsProps) {
  const formatValue = (value: number | string, format?: string) => {
    if (typeof value === 'string') return value
    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toLocaleString()
    }
  }

  const calculateTrend = (current: number | string, previous?: number | string): 'up' | 'down' | 'neutral' => {
    if (!previous || typeof current !== 'number' || typeof previous !== 'number') return 'neutral'
    if (current > previous) return 'up'
    if (current < previous) return 'down'
    return 'neutral'
  }

  const calculateChange = (current: number | string, previous?: number | string): number => {
    if (!previous || typeof current !== 'number' || typeof previous !== 'number') return 0
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
  }

  const colorClasses = {
    blue: {
      border: 'border-blue-200 dark:border-blue-800',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      text: 'text-blue-700 dark:text-blue-300',
      iconBg: 'bg-blue-500',
    },
    green: {
      border: 'border-green-200 dark:border-green-800',
      bg: 'bg-green-50 dark:bg-green-900/20',
      text: 'text-green-700 dark:text-green-300',
      iconBg: 'bg-green-500',
    },
    yellow: {
      border: 'border-yellow-200 dark:border-yellow-800',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      text: 'text-yellow-700 dark:text-yellow-300',
      iconBg: 'bg-yellow-500',
    },
    red: {
      border: 'border-red-200 dark:border-red-800',
      bg: 'bg-red-50 dark:bg-red-900/20',
      text: 'text-red-700 dark:text-red-300',
      iconBg: 'bg-red-500',
    },
    purple: {
      border: 'border-purple-200 dark:border-purple-800',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      text: 'text-purple-700 dark:text-purple-300',
      iconBg: 'bg-purple-500',
    },
  }

  return (
    <div className="space-y-4">
      {title && (
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">{title}</h3>
      )}
      <div className={`grid gap-4 ${gridCols[columns]}`}>
        {stats.map((stat, index) => {
          const trend = stat.trend || calculateTrend(stat.value, stat.previousValue)
          const change = calculateChange(stat.value, stat.previousValue)
          const colors = colorClasses[stat.color || 'blue']

          return (
            <Card
              key={index}
              className={`border-2 ${colors.border} hover:shadow-lg transition-all duration-300`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${colors.text}`}>
                      {formatValue(stat.value, stat.format)}
                    </span>
                    {stat.icon && (
                      <div className={`p-2 rounded-lg ${colors.iconBg} text-white`}>
                        {stat.icon}
                      </div>
                    )}
                  </div>
                  {stat.previousValue !== undefined && (
                    <div className="flex items-center gap-2 text-xs">
                      {trend === 'up' && (
                        <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                      )}
                      {trend === 'down' && (
                        <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                      )}
                      {trend === 'neutral' && (
                        <Minus className="h-3 w-3 text-gray-400" />
                      )}
                      <span
                        className={
                          trend === 'up'
                            ? 'text-green-600 dark:text-green-400'
                            : trend === 'down'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }
                      >
                        {change >= 0 ? '+' : ''}
                        {change.toFixed(1)}% vs previous
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
