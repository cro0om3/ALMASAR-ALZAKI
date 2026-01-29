"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DateRangePicker } from "./DateRangePicker"
import { ExportButton } from "./ExportButton"
import { FileText, Download, Calendar, TrendingUp, DollarSign } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { ExportData } from "@/lib/utils/export-utils"

interface ReportData {
  period: string
  quotations: {
    total: number
    accepted: number
    rejected: number
    totalValue: number
  }
  invoices: {
    total: number
    paid: number
    pending: number
    totalRevenue: number
    pendingAmount: number
  }
  customers: {
    total: number
    new: number
  }
}

export function ReportsPanel() {
  const [reportType, setReportType] = useState<'summary' | 'quotations' | 'invoices' | 'customers'>('summary')
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  })
  const [reportData, setReportData] = useState<ReportData | null>(null)

  const generateReport = async () => {
    const startDate = new Date(dateRange.start)
    const endDate = new Date(dateRange.end)
    endDate.setHours(23, 59, 59, 999)

    try {
      const [qRes, invRes, custRes] = await Promise.all([
        fetch('/api/quotations'),
        fetch('/api/invoices'),
        fetch('/api/customers'),
      ])
      const quotations = (qRes.ok ? await qRes.json() : []).filter((q: any) => {
        const qDate = new Date(q.date)
        return qDate >= startDate && qDate <= endDate
      })
      const invoices = (invRes.ok ? await invRes.json() : []).filter((inv: any) => {
        const invDate = new Date(inv.date)
        return invDate >= startDate && invDate <= endDate
      })
      const customers = (custRes.ok ? await custRes.json() : []).filter((c: any) => {
        const cDate = new Date(c.createdAt || 0)
        return cDate >= startDate && cDate <= endDate
      })

      const data: ReportData = {
      period: `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`,
      quotations: {
        total: quotations.length,
        accepted: quotations.filter((q: any) => q.status === 'accepted').length,
        rejected: quotations.filter((q: any) => q.status === 'rejected').length,
        totalValue: quotations.reduce((sum: number, q: any) => sum + q.total, 0),
      },
      invoices: {
        total: invoices.length,
        paid: invoices.filter((inv: any) => inv.status === 'paid').length,
        pending: invoices.filter((inv: any) => inv.status === 'sent' || inv.status === 'overdue').length,
        totalRevenue: invoices.filter((inv: any) => inv.status === 'paid').reduce((sum: number, inv: any) => sum + inv.total, 0),
        pendingAmount: invoices.filter((inv: any) => inv.status === 'sent' || inv.status === 'overdue').reduce((sum: number, inv: any) => sum + (inv.total - (inv.paidAmount || 0)), 0),
      },
      customers: {
        total: customers.length,
        new: customers.length,
      },
    }

      setReportData(data)
    } catch (_e) {
      setReportData(null)
    }
  }

  const getExportData = (): ExportData => {
    if (!reportData) {
      return {
        title: "Report",
        documentNumber: "",
        date: new Date().toISOString(),
        items: [],
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        total: 0,
      }
    }

    return {
      title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      documentNumber: `RPT-${Date.now()}`,
      date: new Date().toISOString(),
      items: [
        { description: "Total Quotations", quantity: reportData.quotations.total, unitPrice: 0, tax: 0, total: reportData.quotations.total },
        { description: "Accepted Quotations", quantity: reportData.quotations.accepted, unitPrice: 0, tax: 0, total: reportData.quotations.accepted },
        { description: "Total Quotation Value", quantity: 1, unitPrice: reportData.quotations.totalValue, tax: 0, total: reportData.quotations.totalValue },
        { description: "Total Invoices", quantity: reportData.invoices.total, unitPrice: 0, tax: 0, total: reportData.invoices.total },
        { description: "Paid Invoices", quantity: reportData.invoices.paid, unitPrice: 0, tax: 0, total: reportData.invoices.paid },
        { description: "Total Revenue", quantity: 1, unitPrice: reportData.invoices.totalRevenue, tax: 0, total: reportData.invoices.totalRevenue },
        { description: "Pending Amount", quantity: 1, unitPrice: reportData.invoices.pendingAmount, tax: 0, total: reportData.invoices.pendingAmount },
        { description: "Total Customers", quantity: reportData.customers.total, unitPrice: 0, tax: 0, total: reportData.customers.total },
      ],
      subtotal: reportData.quotations.totalValue + reportData.invoices.totalRevenue,
      taxRate: 0,
      taxAmount: 0,
      total: reportData.quotations.totalValue + reportData.invoices.totalRevenue,
      additionalFields: {
        "Period": reportData.period,
        "Report Type": reportType,
      },
    }
  }

  return (
    <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gold dark:text-yellow-400" />
          Reports & Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filters */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-900 dark:text-blue-100">Report Type</label>
            <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
              <SelectTrigger className="h-12 border-2 border-blue-400 dark:border-blue-800/60">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary Report</SelectItem>
                <SelectItem value="quotations">Quotations Report</SelectItem>
                <SelectItem value="invoices">Invoices Report</SelectItem>
                <SelectItem value="customers">Customers Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-900 dark:text-blue-100">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full h-12 px-4 rounded-lg border-2 border-blue-400 dark:border-blue-800/60 bg-white dark:bg-blue-900 text-blue-900 dark:text-blue-100"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-blue-900 dark:text-blue-100">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full h-12 px-4 rounded-lg border-2 border-blue-400 dark:border-blue-800/60 bg-white dark:bg-blue-900 text-blue-900 dark:text-blue-100"
            />
          </div>
        </div>

        <Button
          onClick={generateReport}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <TrendingUp className="mr-2 h-4 w-4" />
          Generate Report
        </Button>

        {/* Report Results */}
        {reportData && (
          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100">Report Results</h3>
              <ExportButton
                data={getExportData()}
                filename={`Report-${reportType}-${dateRange.start}-${dateRange.end}`}
                variant="default"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-400 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Quotations</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{reportData.quotations.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Accepted: {reportData.quotations.accepted} | Rejected: {reportData.quotations.rejected}
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-400">{formatCurrency(reportData.invoices.totalRevenue)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  From {reportData.invoices.paid} paid invoices
                </p>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Amount</p>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{formatCurrency(reportData.invoices.pendingAmount)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  From {reportData.invoices.pending} pending invoices
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg border border-purple-200 dark:border-purple-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">Quotation Value</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400">{formatCurrency(reportData.quotations.totalValue)}</p>
              </div>

              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-400">{reportData.customers.total}</p>
              </div>

              <div className="p-4 bg-pink-50 dark:bg-pink-900/30 rounded-lg border border-pink-200 dark:border-pink-800">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</p>
                <p className="text-2xl font-bold text-pink-700 dark:text-pink-400">{reportData.invoices.total}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Paid: {reportData.invoices.paid} | Pending: {reportData.invoices.pending}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
