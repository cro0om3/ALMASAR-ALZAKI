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
import { Plus, Search, Eye, Edit, Trash2, Receipt } from "lucide-react"
import { invoiceService } from "@/lib/data"
import { customerService } from "@/lib/data"
import { Invoice } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()

  useEffect(() => {
    const loadInvoices = () => {
      const allInvoices = invoiceService.getAll()
      const invoicesWithCustomers = allInvoices.map(i => ({
        ...i,
        customer: customerService.getById(i.customerId),
      }))
      setInvoices(invoicesWithCustomers)
    }
    loadInvoices()
  }, [])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      invoiceService.delete(id)
      setInvoices(invoiceService.getAll().map(i => ({
        ...i,
        customer: customerService.getById(i.customerId),
      })))
    }
  }

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

  const filteredInvoices = invoices.filter((i) => {
    const matchesSearch =
      i.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.customer?.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || i.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Invoices"
        description="Manage your invoices"
        actionLabel={canEdit('invoices') ? "New Invoice" : undefined}
        actionHref={canEdit('invoices') ? "/invoices/new" : undefined}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-base"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 rounded-lg border-2 border-blue-200/60 dark:border-blue-800/60 bg-white dark:bg-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <Card className="border-2 border-blue-200/60 shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/50 dark:to-blue-800/50 border-b-2 border-blue-200 dark:border-blue-800">
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Invoice Number</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Customer</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Date</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Due Date</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Total</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Status</TableHead>
              <TableHead className="text-right font-bold text-blue-900 dark:text-blue-100">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInvoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <Receipt className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-300 font-medium text-lg">No invoices found</p>
                    <p className="text-gray-400 dark:text-gray-400 text-sm">Create your first invoice to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/50 transition-colors border-b border-blue-100 dark:border-blue-800">
                  <TableCell className="font-semibold text-blue-900 dark:text-blue-100">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {invoice.customer?.name || "Unknown Customer"}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{formatDate(invoice.date)}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{formatDate(invoice.dueDate)}</TableCell>
                  <TableCell className="font-semibold text-blue-900 dark:text-blue-100">{formatCurrency(invoice.total)}</TableCell>
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
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit('invoices') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                          className="hover:bg-blue-100 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete('invoices') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(invoice.id)}
                          className="hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
