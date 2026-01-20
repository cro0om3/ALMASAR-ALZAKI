"use client"

import { ReportsPanel } from "@/components/shared/ReportsPanel"
import { PerformanceMetrics } from "@/components/shared/PerformanceMetrics"
import { DashboardWidget } from "@/components/shared/DashboardWidget"
import { PageHeader } from "@/components/shared/PageHeader"
import { FileText, TrendingUp, DollarSign, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { quotationService, invoiceService, customerService } from "@/lib/data"
import { formatCurrency } from "@/lib/utils"

export default function ReportsPage() {
  const [metrics, setMetrics] = useState<any[]>([])

  useEffect(() => {
    const loadMetrics = () => {
      const quotations = quotationService.getAll()
      const invoices = invoiceService.getAll()
      const customers = customerService.getAll()

      // Calculate current month metrics
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

      const currentMonthQuotations = quotations.filter(q => {
        const qDate = new Date(q.date)
        return qDate >= currentMonthStart
      })

      const lastMonthQuotations = quotations.filter(q => {
        const qDate = new Date(q.date)
        return qDate >= lastMonthStart && qDate <= lastMonthEnd
      })

      const currentMonthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date)
        return invDate >= currentMonthStart
      })

      const lastMonthInvoices = invoices.filter(inv => {
        const invDate = new Date(inv.date)
        return invDate >= lastMonthStart && invDate <= lastMonthEnd
      })

      const currentMonthRevenue = currentMonthInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0)

      const lastMonthRevenue = lastMonthInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0)

      setMetrics([
        {
          label: "Monthly Revenue",
          current: currentMonthRevenue,
          previous: lastMonthRevenue,
          format: 'currency',
          target: lastMonthRevenue * 1.1, // 10% growth target
        },
        {
          label: "Quotations This Month",
          current: currentMonthQuotations.length,
          previous: lastMonthQuotations.length,
          format: 'number',
        },
        {
          label: "Invoices This Month",
          current: currentMonthInvoices.length,
          previous: lastMonthInvoices.length,
          format: 'number',
        },
        {
          label: "Total Customers",
          current: customers.length,
          previous: customers.length,
          format: 'number',
        },
        {
          label: "Quotation Value",
          current: currentMonthQuotations.reduce((sum, q) => sum + q.total, 0),
          previous: lastMonthQuotations.reduce((sum, q) => sum + q.total, 0),
          format: 'currency',
        },
        {
          label: "Average Invoice Value",
          current: currentMonthInvoices.length > 0
            ? currentMonthInvoices.reduce((sum, inv) => sum + inv.total, 0) / currentMonthInvoices.length
            : 0,
          previous: lastMonthInvoices.length > 0
            ? lastMonthInvoices.reduce((sum, inv) => sum + inv.total, 0) / lastMonthInvoices.length
            : 0,
          format: 'currency',
        },
      ])
    }

    loadMetrics()
  }, [])

  return (
    <div className="space-y-8">
      <PageHeader
        title="Reports & Analytics"
        description="Generate reports and view performance metrics"
      />

      <PerformanceMetrics metrics={metrics} />

      <ReportsPanel />

      <div className="grid gap-6 md:grid-cols-2">
        <DashboardWidget
          title="Quick Insights"
          description="Key performance indicators"
          icon={<TrendingUp className="h-5 w-5" />}
          variant="highlighted"
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
              <span className="font-bold text-blue-900 dark:text-blue-100">
                {(() => {
                  const quotations = quotationService.getAll()
                  const invoices = invoiceService.getAll()
                  const accepted = quotations.filter(q => q.status === 'accepted').length
                  return quotations.length > 0 ? ((accepted / quotations.length) * 100).toFixed(1) : 0
                })()}%
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
              <span className="text-sm text-gray-600 dark:text-gray-400">Payment Rate</span>
              <span className="font-bold text-green-700 dark:text-green-400">
                {(() => {
                  const invoices = invoiceService.getAll()
                  const paid = invoices.filter(inv => inv.status === 'paid').length
                  return invoices.length > 0 ? ((paid / invoices.length) * 100).toFixed(1) : 0
                })()}%
              </span>
            </div>
          </div>
        </DashboardWidget>

        <DashboardWidget
          title="Top Customers"
          description="By revenue"
          icon={<Users className="h-5 w-5" />}
        >
          <div className="space-y-2">
            {(() => {
              const invoices = invoiceService.getAll()
              const customerRevenue: Record<string, number> = {}
              
              invoices
                .filter(inv => inv.status === 'paid')
                .forEach(inv => {
                  customerRevenue[inv.customerId] = (customerRevenue[inv.customerId] || 0) + inv.total
                })

              const topCustomers = Object.entries(customerRevenue)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([customerId, revenue]) => {
                  const customer = customerService.getById(customerId)
                  return { customer, revenue }
                })
                .filter(item => item.customer)

              return topCustomers.length > 0 ? (
                topCustomers.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-900/30 rounded">
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {index + 1}. {item.customer?.name}
                    </span>
                    <span className="text-sm font-bold text-gold dark:text-yellow-400">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  No data available
                </p>
              )
            })()}
          </div>
        </DashboardWidget>
      </div>
    </div>
  )
}
