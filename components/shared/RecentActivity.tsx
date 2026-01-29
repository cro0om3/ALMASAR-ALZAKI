"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate, formatCurrency } from "@/lib/utils"
import { FileText, Receipt, ShoppingCart, UserPlus, Building2, Truck, Clock } from "lucide-react"
import Link from "next/link"

interface Activity {
  id: string
  type: 'quotation' | 'invoice' | 'purchase_order' | 'customer' | 'vendor' | 'project'
  title: string
  subtitle?: string
  amount?: number
  status?: string
  date: string
  link: string
}

interface RecentActivityProps {
  activities?: Activity[]
  limit?: number
  showAmount?: boolean
}

export function RecentActivity({
  activities = [],
  limit = 10,
  showAmount = true,
}: RecentActivityProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'quotation':
        return <FileText className="h-4 w-4" />
      case 'invoice':
        return <Receipt className="h-4 w-4" />
      case 'purchase_order':
        return <ShoppingCart className="h-4 w-4" />
      case 'customer':
        return <UserPlus className="h-4 w-4" />
      case 'vendor':
        return <Building2 className="h-4 w-4" />
      case 'project':
        return <FileText className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'quotation':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
      case 'invoice':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
      case 'purchase_order':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
      case 'customer':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
      case 'vendor':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300'
      case 'project':
        return 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
    }
  }

  const getStatusBadgeVariant = (status?: string) => {
    if (!status) return 'default'
    switch (status.toLowerCase()) {
      case 'paid':
      case 'accepted':
      case 'completed':
        return 'success'
      case 'sent':
      case 'pending':
        return 'default'
      case 'overdue':
      case 'rejected':
      case 'expired':
        return 'destructive'
      case 'draft':
        return 'secondary'
      default:
        return 'default'
    }
  }

  if (activities.length === 0) {
    return (
      <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
          <Clock className="h-5 w-5 text-gold dark:text-yellow-400" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.slice(0, limit).map((activity) => (
            <Link
              key={activity.id}
              href={activity.link}
              className="block p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${getActivityColor(activity.type)} flex-shrink-0`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 truncate">
                        {activity.title}
                      </h4>
                      {activity.subtitle && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {activity.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {showAmount && activity.amount !== undefined && (
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300 whitespace-nowrap">
                          {formatCurrency(activity.amount)}
                        </span>
                      )}
                      {activity.status && (
                        <Badge variant={getStatusBadgeVariant(activity.status)} className="text-xs">
                          {activity.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(activity.date)}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
