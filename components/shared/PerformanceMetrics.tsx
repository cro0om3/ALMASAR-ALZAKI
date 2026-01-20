"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Minus, Target } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface Metric {
  label: string
  current: number
  previous: number
  format?: 'currency' | 'number' | 'percentage'
  target?: number
}

interface PerformanceMetricsProps {
  metrics: Metric[]
  title?: string
}

export function PerformanceMetrics({ metrics, title = "Performance Metrics" }: PerformanceMetricsProps) {
  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case 'currency':
        return formatCurrency(value)
      case 'percentage':
        return `${value.toFixed(1)}%`
      default:
        return value.toLocaleString()
    }
  }

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }

  const getProgress = (current: number, target: number): number => {
    if (target === 0) return 0
    return Math.min((current / target) * 100, 100)
  }

  return (
    <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
          <Target className="h-5 w-5 text-gold dark:text-yellow-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {metrics.map((metric, index) => {
            const change = calculateChange(metric.current, metric.previous)
            const trend = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
            const progress = metric.target ? getProgress(metric.current, metric.target) : 0

            return (
              <div
                key={index}
                className="p-4 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-blue-900/10 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {metric.label}
                  </p>
                  {trend === 'up' && (
                    <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                  )}
                  {trend === 'down' && (
                    <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                  )}
                  {trend === 'neutral' && (
                    <Minus className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                  {formatValue(metric.current, metric.format)}
                </p>
                <div className="flex items-center justify-between text-xs">
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
                  {metric.target && (
                    <span className="text-gray-500 dark:text-gray-400">
                      Target: {formatValue(metric.target, metric.format)}
                    </span>
                  )}
                </div>
                {metric.target && (
                  <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        progress >= 100
                          ? 'bg-green-500'
                          : progress >= 75
                          ? 'bg-blue-500'
                          : progress >= 50
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
