"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { TrendingUp, Calendar } from "lucide-react"

interface RevenueChartProps {
  monthlyData: Array<{ month: string; revenue: number; count: number }>
  title?: string
  description?: string
}

export function RevenueChart({
  monthlyData,
  title = "Revenue Trend",
  description = "Monthly revenue over the last 12 months",
}: RevenueChartProps) {
  const maxRevenue = monthlyData.length > 0
    ? Math.max(...monthlyData.map(d => d.revenue))
    : 0

  // Get last 6 months for better visualization
  const displayData = monthlyData.slice(-6)

  return (
    <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gold dark:text-yellow-400" />
              {title}
            </CardTitle>
            <CardDescription className="mt-1 dark:text-gray-400">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {displayData.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
            <p>No data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Chart bars */}
            <div className="flex items-end justify-between gap-2 h-48">
              {displayData.map((month, index) => {
                const percent = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0
                const isLatest = index === displayData.length - 1
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="relative w-full h-full flex flex-col justify-end">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 dark:bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                        {month.month}: {formatCurrency(month.revenue)}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                          <div className="border-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                        </div>
                      </div>
                      
                      {/* Bar */}
                      <div
                        className={`relative w-full rounded-t transition-all duration-500 hover:opacity-80 ${
                          isLatest
                            ? 'bg-gradient-to-t from-blue-600 to-blue-500 dark:from-blue-700 dark:to-blue-600'
                            : 'bg-gradient-to-t from-blue-500 to-blue-400 dark:from-blue-600 dark:to-blue-500'
                        }`}
                        style={{ height: `${percent}%`, minHeight: percent > 0 ? '4px' : '0' }}
                      >
                        {/* Value label on bar */}
                        {month.revenue > 0 && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold text-blue-700 dark:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            {formatCurrency(month.revenue)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Month label */}
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium truncate w-full text-center">
                      {month.month}
                    </div>
                    
                    {/* Count badge */}
                    {month.count > 0 && (
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {month.count} {month.count === 1 ? 'invoice' : 'invoices'}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Summary stats */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(monthlyData.reduce((sum, m) => sum + m.revenue, 0))}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Average/Month</p>
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                    {formatCurrency(
                      monthlyData.length > 0
                        ? monthlyData.reduce((sum, m) => sum + m.revenue, 0) / monthlyData.length
                        : 0
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Growth</p>
                  <div className="flex items-center gap-1">
                    {displayData.length >= 2 && (
                      <>
                        {displayData[displayData.length - 1].revenue >= displayData[displayData.length - 2].revenue ? (
                          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-600 dark:text-red-400 rotate-180" />
                        )}
                        <p className={`text-lg font-bold ${
                          displayData[displayData.length - 1].revenue >= displayData[displayData.length - 2].revenue
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {displayData.length >= 2
                            ? (((displayData[displayData.length - 1].revenue - displayData[displayData.length - 2].revenue) / 
                                (displayData[displayData.length - 2].revenue || 1)) * 100).toFixed(1)
                            : 0}%
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
