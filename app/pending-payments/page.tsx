"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Eye, Receipt as ReceiptIcon, Plus } from "lucide-react"
import { Invoice } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"

export default function PendingPaymentsPage() {
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const load = async () => {
      try {
        const [invRes, rcpRes, custRes] = await Promise.all([
          fetch('/api/invoices'),
          fetch('/api/receipts'),
          fetch('/api/customers'),
        ])
        if (cancelled) return
        const invoices = invRes.ok ? await invRes.json() : []
        const receipts = rcpRes.ok ? await rcpRes.json() : []
        const customers = custRes.ok ? await custRes.json() : []
        const customerMap = new Map((customers || []).map((c: any) => [c.id, c]))
        const pending = (invoices || []).filter((inv: any) => {
          if (inv.status === 'cancelled') return false
          const totalPaid = (receipts || [])
            .filter((r: any) => r.invoiceId === inv.id && r.status !== 'cancelled')
            .reduce((sum: number, r: any) => sum + r.amount, 0)
          return totalPaid < inv.total
        })
        const invoicesWithCustomers = pending.map((inv: any) => ({
          ...inv,
          customer: customerMap.get(inv.customerId),
        }))
        if (!cancelled) setPendingInvoices(invoicesWithCustomers)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const filteredInvoices = pendingInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.projectName?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  const totalPending = filteredInvoices.reduce((sum, inv) => {
    return sum + (inv.total - (inv.paidAmount || 0))
  }, 0)

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success"
      case "sent":
        return "default"
      case "overdue":
        return "destructive"
      case "cancelled":
        return "warning"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Pending Payments"
        description="Invoices with outstanding balances"
      />

      <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by invoice number, customer, or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-blue-400 dark:border-blue-800/60"
                />
              </div>
            </div>
          </div>

          {filteredInvoices.length > 0 && (
            <div className="bg-gradient-to-r from-red-50 via-orange-50 to-red-50 dark:from-red-900/30 dark:via-orange-900/30 dark:to-red-900/30 p-4 rounded-lg border-2 border-red-300 dark:border-red-700 shadow-md">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-900 dark:text-blue-100">Total Pending Amount:</span>
                <span className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalPending)}</span>
              </div>
            </div>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-b-0">
              <TableHead className="font-bold text-white">Invoice Number</TableHead>
              <TableHead className="font-bold text-white">Customer</TableHead>
              <TableHead className="font-bold text-white">Project</TableHead>
              <TableHead className="font-bold text-white">Invoice Date</TableHead>
              <TableHead className="font-bold text-white">Due Date</TableHead>
              <TableHead className="font-bold text-white">Total Amount</TableHead>
              <TableHead className="font-bold text-white">Paid Amount</TableHead>
              <TableHead className="font-bold text-white">Pending</TableHead>
              <TableHead className="font-bold text-white">Status</TableHead>
              <TableHead className="text-right font-bold text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <ReceiptIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-300 font-medium">No pending payments found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-400">All invoices are fully paid!</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => {
                const pending = invoice.total - (invoice.paidAmount || 0)
                return (
                  <TableRow key={invoice.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/50 border-b border-blue-100 dark:border-blue-800 transition-colors duration-200">
                    <TableCell className="font-semibold text-blue-900 dark:text-blue-100">
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{invoice.customer?.name || "N/A"}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{invoice.projectName || "-"}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">{formatDate(invoice.date)}</TableCell>
                    <TableCell className="text-gray-700 dark:text-gray-300">
                      <span className={new Date(invoice.dueDate) < new Date() ? "text-red-600 dark:text-red-400 font-semibold" : ""}>
                        {formatDate(invoice.dueDate)}
                      </span>
                    </TableCell>
                    <TableCell className="font-semibold text-gray-700 dark:text-gray-300">{formatCurrency(invoice.total)}</TableCell>
                    <TableCell className="text-gold dark:text-yellow-400 font-semibold">
                      {formatCurrency(invoice.paidAmount || 0)}
                    </TableCell>
                    <TableCell className="text-red-600 dark:text-red-400 font-bold">
                      {formatCurrency(pending)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(invoice.status)} className="font-semibold">
                        {invoice.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/invoices/${invoice.id}`)}
                          className="hover:bg-blue-100 hover:text-blue-700"
                          title="View Invoice"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/receipts/new?invoiceId=${invoice.id}`)}
                          className="hover:bg-yellow-100 hover:text-yellow-700"
                          title="Record Payment"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
