"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Receipt, ShoppingCart, Users, Clock, ArrowRight } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"
import Link from "next/link"
interface ActivityItem {
  id: string
  type: 'quotation' | 'invoice' | 'purchase_order'
  title: string
  subtitle: string
  amount?: number
  date: string
  status: string
  link: string
}

export function ActivityFeed() {
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [qRes, invRes, poRes] = await Promise.all([
          fetch('/api/quotations'),
          fetch('/api/invoices'),
          fetch('/api/purchase-orders'),
        ])
        if (cancelled) return
        const quotations = (qRes.ok ? await qRes.json() : [])
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map((q: any) => ({
            id: q.id,
            type: 'quotation' as const,
            title: q.quotationNumber,
            subtitle: `Quotation created`,
            amount: q.total,
            date: q.createdAt,
            status: q.status,
            link: `/quotations/${q.id}`,
          }))
        const invoices = (invRes.ok ? await invRes.json() : [])
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 3)
          .map((inv: any) => ({
            id: inv.id,
            type: 'invoice' as const,
            title: inv.invoiceNumber,
            subtitle: `Invoice ${inv.status}`,
            amount: inv.total,
            date: inv.createdAt,
            status: inv.status,
            link: `/invoices/${inv.id}`,
          }))
        const purchaseOrders = (poRes.ok ? await poRes.json() : [])
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 2)
          .map((po: any) => ({
            id: po.id,
            type: 'purchase_order' as const,
            title: po.orderNumber,
            subtitle: `Purchase order created`,
            amount: po.total,
            date: po.createdAt,
            status: po.status,
            link: `/purchase-orders/${po.id}`,
          }))
        const activities = [...quotations, ...invoices, ...purchaseOrders]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 8)
        if (!cancelled) setRecentActivities(activities)
      } catch (_e) {
        if (!cancelled) setRecentActivities([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const getIcon = (type: string) => {
    switch (type) {
      case 'quotation':
        return FileText
      case 'invoice':
        return Receipt
      case 'purchase_order':
        return ShoppingCart
      default:
        return FileText
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'quotation':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
      case 'invoice':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
      case 'purchase_order':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'accepted':
        return 'success'
      case 'sent':
        return 'default'
      case 'overdue':
      case 'rejected':
        return 'destructive'
      case 'draft':
        return 'secondary'
      default:
        return 'default'
    }
  }

  if (recentActivities.length === 0) {
    return (
      <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Recent Activity</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500 dark:text-gray-400 font-medium">
            No recent activity
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Recent Activity</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivities.map((activity, index) => {
            const Icon = getIcon(activity.type)
            const isLast = index === recentActivities.length - 1
            
            return (
              <Link key={activity.id} href={activity.link}>
                <div className="relative flex items-start gap-3 p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors cursor-pointer group">
                  {/* Timeline line */}
                  {!isLast && (
                    <div className="absolute left-6 top-12 w-0.5 h-full bg-blue-200 dark:bg-blue-800"></div>
                  )}
                  
                  {/* Icon */}
                  <div className={`relative z-10 p-2 rounded-lg ${getColor(activity.type)} group-hover:scale-110 transition-transform`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-900 dark:text-blue-100">{activity.title}</span>
                        <Badge variant={getStatusColor(activity.status)} className="text-xs">
                          {activity.status}
                        </Badge>
                      </div>
                      {activity.amount && (
                        <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                          {formatCurrency(activity.amount)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                      <span>{activity.subtitle}</span>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(activity.date)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Arrow */}
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
