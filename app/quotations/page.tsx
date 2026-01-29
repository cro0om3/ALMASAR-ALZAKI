"use client"

import { useState, useEffect } from "react"
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
import { Card } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, Eye, Edit, Trash2, FileText, Download, FileSpreadsheet, File, ShoppingCart } from "lucide-react"
import { Quotation } from "@/types"
import type { Customer } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { PageHeader } from "@/components/shared/PageHeader"
import { exportToExcel, exportToWord, exportToPDF, ExportData } from "@/lib/utils/export-utils"
import { useToast } from "@/lib/hooks/use-toast"

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<(Quotation & { customer?: Customer | null })[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()
  const canCreatePO = canEdit('purchase_orders')
  const { toast } = useToast()

  const buildExportData = (q: Quotation & { customer?: Customer | null }, customer: Customer | null): ExportData => ({
    title: "Quotation",
    documentNumber: q.quotationNumber,
    date: q.date,
    customer: customer ? { name: customer.name, email: customer.email, phone: customer.phone, address: customer.address } : undefined,
    items: (q.items || []).map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      hours: item.hours,
      days: item.days,
      unitPrice: item.unitPrice,
      tax: item.tax,
      total: item.total,
      vehicleNumber: item.vehicleNumber,
    })),
    subtotal: q.subtotal ?? 0,
    taxRate: q.taxRate,
    taxAmount: q.taxAmount,
    total: q.total,
    terms: q.terms,
    notes: q.notes,
    additionalFields: {
      "Valid Until": formatDate(q.validUntil),
      "Status": q.status,
    },
  })

  const handleExportQuotation = async (id: string, type: 'excel' | 'word' | 'pdf') => {
    try {
      const qRes = await fetch(`/api/quotations/${id}`)
      if (!qRes.ok) throw new Error('Failed to load quotation')
      const q = await qRes.json()
      const cRes = await fetch(`/api/customers/${q.customerId || ''}`)
      const customer = cRes.ok ? await cRes.json() : null
      const data = buildExportData({ ...q, customer }, customer)
      const filename = `Quotation-${q.quotationNumber}`
      switch (type) {
        case 'excel': exportToExcel(data, filename); break
        case 'word': exportToWord(data, filename); break
        case 'pdf': exportToPDF(data, filename); break
      }
      toast({ title: "Export Successful", description: `Quotation exported to ${type.toUpperCase()} successfully` })
    } catch {
      toast({ title: "Export Failed", description: "Failed to export quotation.", variant: "destructive" })
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [qRes, cRes] = await Promise.all([
        fetch('/api/quotations'),
        fetch('/api/customers'),
      ])
      if (!qRes.ok || !cRes.ok) throw new Error('Failed to load')
      const [allQuotations, allCustomers] = await Promise.all([qRes.json(), cRes.json()])
      const customerMap = new Map((allCustomers || []).map((c: Customer) => [c.id, c]))
      setQuotations((allQuotations || []).map((q: Quotation) => ({
        ...q,
        customer: customerMap.get(q.customerId) ?? null,
      })))
    } catch (e) {
      console.error(e)
      setQuotations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this quotation?")) return
    try {
      const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      await loadData()
    } catch (e) {
      console.error(e)
      alert('Failed to delete quotation.')
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "accepted":
        return "success"
      case "sent":
        return "default"
      case "rejected":
        return "destructive"
      case "expired":
        return "warning"
      default:
        return "secondary"
    }
  }

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer?.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || q.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Quotations"
        description="Manage your quotations"
        actionLabel={canEdit('quotations') ? "New Quotation" : undefined}
        actionHref={canEdit('quotations') ? "/quotations/new" : undefined}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-base"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 rounded-lg border-2 border-blue-400 dark:border-blue-800/60 bg-white px-4 py-2 text-sm font-semibold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-b-0">
              <TableHead className="font-bold text-white">Quote Number</TableHead>
              <TableHead className="font-bold text-white">Customer</TableHead>
              <TableHead className="font-bold text-white">Date</TableHead>
              <TableHead className="font-bold text-white">Total</TableHead>
              <TableHead className="font-bold text-white">Status</TableHead>
              <TableHead className="text-right font-bold text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="h-12 w-12 text-gray-300" />
                    <p className="text-gray-500 font-medium text-lg">No quotations found</p>
                    <p className="text-gray-400 text-sm">Create your first quotation to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">
                    {quotation.quotationNumber}
                  </TableCell>
                  <TableCell>
                    {quotation.customer?.name || "Unknown Customer"}
                  </TableCell>
                  <TableCell>{formatDate(quotation.date)}</TableCell>
                  <TableCell>{formatCurrency(quotation.total)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(quotation.status)}>
                      {quotation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/quotations/${quotation.id}`)}
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit('quotations') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/quotations/${quotation.id}/edit`)}
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canCreatePO && (
                        <Link href={`/purchase-orders/new?fromQuotation=${quotation.id}`}>
                          <Button variant="ghost" size="icon" title="Create Purchase Order">
                            <ShoppingCart className="h-4 w-4" />
                          </Button>
                        </Link>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" title="Export">
                            <Download className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleExportQuotation(quotation.id, 'excel')}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Excel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportQuotation(quotation.id, 'word')}>
                            <FileText className="mr-2 h-4 w-4" />
                            Word
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportQuotation(quotation.id, 'pdf')}>
                            <File className="mr-2 h-4 w-4" />
                            PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {canDelete('quotations') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(quotation.id)}
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
        )}
      </Card>
    </div>
  )
}
