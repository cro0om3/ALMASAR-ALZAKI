"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

interface StatsChartProps {
  title: string
  value: number
  previousValue?: number
  format?: 'currency' | 'number' | 'percentage'
  icon?: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  description?: string
  data?: Array<{ label: string; value: number }>
}

export function StatsChart({
  title,
  value,
  previousValue,
  format = 'number',
  icon,
  color = 'blue',
  description,
  data,
}: StatsChartProps) {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-500',
      text: 'text-blue-700 dark:text-blue-300',
      border: 'border-blue-200 dark:border-blue-800',
      gradient: 'from-blue-500 to-blue-600',
      lightBg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    green: {
      bg: 'bg-green-500',
      text: 'text-green-700 dark:text-green-300',
      border: 'border-green-200 dark:border-green-800',
      gradient: 'from-green-500 to-green-600',
      lightBg: 'bg-green-50 dark:bg-green-900/20',
    },
    yellow: {
      bg: 'bg-yellow-500',
      text: 'text-yellow-700 dark:text-yellow-300',
      border: 'border-yellow-200 dark:border-yellow-800',
      gradient: 'from-yellow-500 to-yellow-600',
      lightBg: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    red: {
      bg: 'bg-red-500',
      text: 'text-red-700 dark:text-red-300',
      border: 'border-red-200 dark:border-red-800',
      gradient: 'from-red-500 to-red-600',
      lightBg: 'bg-red-50 dark:bg-red-900/20',
    },
    purple: {
      bg: 'bg-purple-500',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-200 dark:border-purple-800',
      gradient: 'from-purple-500 to-purple-600',
      lightBg: 'bg-purple-50 dark:bg-purple-900/20',
    },
  }

  const colors = colorClasses[color]

  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val)
      case 'percentage':
        return `${val.toFixed(1)}%`
      default:
        return val.toLocaleString()
    }
  }

  const changePercent = previousValue
    ? ((value - previousValue) / previousValue) * 100
    : 0

  // Calculate max value for chart visualization
  const allValues = data ? data.map(d => d.value) : [value, previousValue || 0].filter(v => v > 0)
  const maxValue = allValues.length > 0 ? Math.max(...allValues) : value
  const currentPercent = maxValue > 0 ? (value / maxValue) * 100 : 0
  const previousPercent = previousValue && maxValue > 0 ? (previousValue / maxValue) * 100 : 0

  return (
    <Card className={`group relative overflow-hidden border-2 ${colors.border} hover:${colors.border.replace('200', '400').replace('800', '600')} transition-all duration-500`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.lightBg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <div className="flex-1">
          <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">{title}</CardTitle>
          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>
        {icon && (
          <div className={`p-3 bg-gradient-to-br ${colors.gradient} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <div className="text-white">
              {icon}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="relative z-10 space-y-4">
        <div className={`text-3xl font-bold ${colors.text} mb-1`}>
          {formatValue(value)}
        </div>

        {/* Line chart for data points */}
        {data && data.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-1 h-20">
              {data.map((point, index) => {
                const percent = maxValue > 0 ? (point.value / maxValue) * 100 : 0
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="relative w-full h-16 bg-gray-100 dark:bg-gray-800 rounded-t">
                      <div
                        className={`absolute bottom-0 w-full ${colors.bg} rounded-t transition-all duration-500 hover:opacity-80`}
                        style={{ height: `${percent}%` }}
                        title={`${point.label}: ${formatValue(point.value)}`}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate w-full text-center">
                      {point.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Simple bar chart for comparison */}
        {!data && (
          <div className="space-y-2">
            <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`absolute left-0 top-0 h-full ${colors.bg} rounded-full transition-all duration-500`}
                style={{ width: `${currentPercent}%` }}
              />
            </div>
            {previousValue && (
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden opacity-50">
                <div
                  className="absolute left-0 top-0 h-full bg-gray-400 dark:bg-gray-600 rounded-full transition-all duration-500"
                  style={{ width: `${previousPercent}%` }}
                />
              </div>
            )}
          </div>
        )}

        {previousValue && (
          <div className="flex items-center gap-2 text-xs pt-2 border-t border-gray-200 dark:border-gray-800">
            {changePercent >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
            )}
            <span
              className={`font-semibold ${
                changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(1)}%
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              vs previous period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
