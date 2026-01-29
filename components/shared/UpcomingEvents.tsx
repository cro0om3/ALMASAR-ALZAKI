"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, AlertCircle } from "lucide-react"
import { formatDate, calculateDaysRemaining } from "@/lib/utils"
import Link from "next/link"

interface UpcomingEvent {
  id: string
  type: 'residence_expiry' | 'quotation_expiry' | 'invoice_due'
  title: string
  date: string
  daysRemaining: number
  status: 'expired' | 'critical' | 'warning' | 'upcoming'
  link: string
}

export function UpcomingEvents({ limit = 10 }: { limit?: number }) {
  const [events, setEvents] = useState<UpcomingEvent[]>([])

  useEffect(() => {
    let cancelled = false
    const loadEvents = async () => {
      try {
        const [custRes, vendRes, empRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/vendors'),
          fetch('/api/employees'),
        ])
        if (cancelled) return
        const customers = custRes.ok ? await custRes.json() : []
        const vendors = vendRes.ok ? await vendRes.json() : []
        const employees = empRes.ok ? await empRes.json() : []
        const allEvents: UpcomingEvent[] = []
        ;(customers || []).forEach((customer: any) => {
          if (customer.residenceExpiryDate) {
            const days = calculateDaysRemaining(customer.residenceExpiryDate)
            let status: 'expired' | 'critical' | 'warning' | 'upcoming' = 'upcoming'
            if (days < 0) status = 'expired'
            else if (days <= 30) status = 'critical'
            else if (days <= 60) status = 'warning'
            allEvents.push({
              id: `customer-${customer.id}`,
              type: 'residence_expiry',
              title: `${customer.name} - Residence Expiry`,
              date: customer.residenceExpiryDate,
              daysRemaining: days,
              status,
              link: `/customers/${customer.id}`,
            })
          }
        })
        ;(vendors || []).forEach((vendor: any) => {
          if (vendor.residenceExpiryDate) {
            const days = calculateDaysRemaining(vendor.residenceExpiryDate)
            let status: 'expired' | 'critical' | 'warning' | 'upcoming' = 'upcoming'
            if (days < 0) status = 'expired'
            else if (days <= 30) status = 'critical'
            else if (days <= 60) status = 'warning'
            allEvents.push({
              id: `vendor-${vendor.id}`,
              type: 'residence_expiry',
              title: `${vendor.name} - Residence Expiry`,
              date: vendor.residenceExpiryDate,
              daysRemaining: days,
              status,
              link: `/vendors/${vendor.id}`,
            })
          }
        })
        ;(employees || []).forEach((employee: any) => {
          if (employee.residenceExpiryDate) {
            const days = calculateDaysRemaining(employee.residenceExpiryDate)
            let status: 'expired' | 'critical' | 'warning' | 'upcoming' = 'upcoming'
            if (days < 0) status = 'expired'
            else if (days <= 30) status = 'critical'
            else if (days <= 60) status = 'warning'
            allEvents.push({
              id: `employee-${employee.id}`,
              type: 'residence_expiry',
              title: `${employee.firstName} ${employee.lastName} - Residence Expiry`,
              date: employee.residenceExpiryDate,
              daysRemaining: days,
              status,
              link: `/employees/${employee.id}`,
            })
          }
        })
        allEvents.sort((a, b) => {
          if (a.status === 'expired' && b.status !== 'expired') return -1
          if (a.status !== 'expired' && b.status === 'expired') return 1
          return a.daysRemaining - b.daysRemaining
        })
        if (!cancelled) setEvents(allEvents.slice(0, limit))
      } catch (_e) {
        if (!cancelled) setEvents([])
      }
    }
    loadEvents()
    return () => { cancelled = true }
  }, [limit])

  const getStatusBadge = (status: UpcomingEvent['status']) => {
    switch (status) {
      case 'expired':
        return <Badge variant="destructive">Expired</Badge>
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>
      case 'warning':
        return <Badge variant="warning">Warning</Badge>
      default:
        return <Badge variant="default">Upcoming</Badge>
    }
  }

  if (events.length === 0) {
    return (
      <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gold dark:text-yellow-400" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No upcoming events
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gold dark:text-yellow-400" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {events.map((event) => (
            <Link
              key={event.id}
              href={event.link}
              className="block p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <AlertCircle className={`h-4 w-4 flex-shrink-0 ${
                    event.status === 'expired' || event.status === 'critical'
                      ? 'text-red-600 dark:text-red-400'
                      : event.status === 'warning'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`} />
                  <span className="font-semibold text-blue-900 dark:text-blue-100 text-sm truncate">
                    {event.title}
                  </span>
                </div>
                {getStatusBadge(event.status)}
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(event.date)}</span>
                </div>
                <span className={
                  event.daysRemaining < 0
                    ? 'text-red-600 dark:text-red-400 font-semibold'
                    : event.daysRemaining <= 30
                    ? 'text-yellow-600 dark:text-yellow-400 font-semibold'
                    : 'text-gray-600 dark:text-gray-400'
                }>
                  {event.daysRemaining < 0
                    ? `${Math.abs(event.daysRemaining)} days overdue`
                    : `${event.daysRemaining} days remaining`}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
