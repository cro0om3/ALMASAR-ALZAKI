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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, Eye, Edit, Trash2, Receipt, Download, FileSpreadsheet, FileText, File } from "lucide-react"
import { Invoice } from "@/types"
import type { Customer } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { exportToExcel, exportToWord, exportToPDF, ExportData } from "@/lib/utils/export-utils"
import { useToast } from "@/lib/hooks/use-toast"

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<(Invoice & { customer?: Customer | null })[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()
  const { toast } = useToast()

  const buildExportData = (inv: Invoice & { customer?: Customer | null }, customer: Customer | null): ExportData => ({
    title: "TAX INVOICE",
    documentNumber: inv.invoiceNumber,
    date: inv.date,
    customer: customer ? { name: customer.name, email: customer.email, phone: customer.phone, address: customer.address } : undefined,
    items: (inv.items || []).map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      hours: item.hours,
      days: item.days,
      unitPrice: item.unitPrice,
      tax: item.tax,
      total: item.total,
      vehicleNumber: item.vehicleNumber,
    })),
    subtotal: inv.subtotal ?? 0,
    taxRate: inv.taxRate,
    taxAmount: inv.taxAmount,
    total: inv.total,
    terms: inv.terms,
    notes: inv.notes,
    additionalFields: {
      "Due Date": formatDate(inv.dueDate),
      "Status": inv.status,
      "Project Name": inv.projectName,
      "LPO Number": inv.lpoNumber,
      "Scope of Work": inv.scopeOfWork,
    },
  })

  const handleExportInvoice = async (id: string, type: 'excel' | 'word' | 'pdf') => {
    try {
      const invRes = await fetch(`/api/invoices/${id}`)
      if (!invRes.ok) throw new Error('Failed to load invoice')
      const inv = await invRes.json()
      const cRes = await fetch(`/api/customers/${inv.customerId || ''}`)
      const customer = cRes.ok ? await cRes.json() : null
      const data = buildExportData({ ...inv, customer }, customer)
      const filename = `Invoice-${inv.invoiceNumber}`
      switch (type) {
        case 'excel': exportToExcel(data, filename); break
        case 'word': exportToWord(data, filename); break
        case 'pdf': exportToPDF(data, filename); break
      }
      toast({ title: "Export Successful", description: `Invoice exported to ${type.toUpperCase()} successfully` })
    } catch {
      toast({ title: "Export Failed", description: "Failed to export invoice.", variant: "destructive" })
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [invRes, cRes] = await Promise.all([
        fetch('/api/invoices'),
        fetch('/api/customers'),
      ])
      if (!invRes.ok || !cRes.ok) throw new Error('Failed to load')
      const [allInvoices, allCustomers] = await Promise.all([invRes.json(), cRes.json()])
      const customerMap = new Map((allCustomers || []).map((c: Customer) => [c.id, c]))
      setInvoices((allInvoices || []).map((i: Invoice) => ({
        ...i,
        customer: customerMap.get(i.customerId) ?? null,
      })))
    } catch (e) {
      console.error(e)
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return
    try {
      const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      await loadData()
    } catch (e) {
      console.error(e)
      alert('Failed to delete invoice.')
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
          className="h-12 rounded-lg border-2 border-blue-400 dark:border-blue-800/60 bg-white dark:bg-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-b-0">
              <TableHead className="font-bold text-white">Invoice Number</TableHead>
              <TableHead className="font-bold text-white">Customer</TableHead>
              <TableHead className="font-bold text-white">Date</TableHead>
              <TableHead className="font-bold text-white">Due Date</TableHead>
              <TableHead className="font-bold text-white">Total</TableHead>
              <TableHead className="font-bold text-white">Status</TableHead>
              <TableHead className="text-right font-bold text-white">Actions</TableHead>
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
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit('invoices') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                          className="hover:bg-blue-100 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" title="Export">
                            <Download className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleExportInvoice(invoice.id, 'excel')}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Excel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportInvoice(invoice.id, 'word')}>
                            <FileText className="mr-2 h-4 w-4" />
                            Word
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportInvoice(invoice.id, 'pdf')}>
                            <File className="mr-2 h-4 w-4" />
                            PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {canDelete('invoices') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(invoice.id)}
                          className="hover:bg-red-100 hover:text-red-600"
                          title="Delete"
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
