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
import { Plus, Search, Eye, Edit, Trash2, Receipt as ReceiptIcon, Download, FileSpreadsheet, FileText, File } from "lucide-react"
import { Receipt } from "@/types"
import type { Invoice, Customer } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { exportToExcel, exportToWord, exportToPDF, ExportData } from "@/lib/utils/export-utils"
import { useToast } from "@/lib/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<(Receipt & { invoice?: Invoice; customer?: Customer })[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()
  const { toast } = useToast()

  const getPaymentMethodLabelForExport = (method: string) => {
    switch (method) {
      case "cash": return "Cash"
      case "bank_transfer": return "Bank Transfer"
      case "cheque": return "Cheque"
      case "credit_card": return "Credit Card"
      default: return "Other"
    }
  }

  const buildExportData = (receipt: Receipt & { invoice?: Invoice; customer?: Customer }): ExportData => ({
    title: "PAYMENT RECEIPT",
    documentNumber: receipt.receiptNumber,
    date: receipt.date,
    customer: receipt.customer ? { name: receipt.customer.name, email: receipt.customer.email, phone: receipt.customer.phone, address: receipt.customer.address } : undefined,
    items: [{
      description: `Payment for Invoice ${receipt.invoice?.invoiceNumber || 'N/A'}`,
      quantity: 1,
      unitPrice: receipt.amount,
      total: receipt.amount,
    }],
    subtotal: receipt.amount,
    total: receipt.amount,
    notes: receipt.notes,
    additionalFields: {
      "Payment Date": formatDate(receipt.paymentDate),
      "Invoice Number": receipt.invoice?.invoiceNumber || "N/A",
      "Payment Method": getPaymentMethodLabelForExport(receipt.paymentMethod),
      "Reference Number": receipt.referenceNumber ?? "",
      "Bank Name": receipt.bankName ?? "",
      "Status": receipt.status,
    },
  })

  const handleExportReceipt = async (id: string, type: 'excel' | 'word' | 'pdf') => {
    try {
      const rRes = await fetch(`/api/receipts/${id}`)
      if (!rRes.ok) throw new Error('Failed to load receipt')
      const receipt = await rRes.json()
      const [iRes, cRes] = await Promise.all([
        receipt.invoiceId ? fetch(`/api/invoices/${receipt.invoiceId}`) : Promise.resolve({ ok: false }),
        receipt.customerId ? fetch(`/api/customers/${receipt.customerId}`) : Promise.resolve({ ok: false }),
      ])
      const invoice = iRes instanceof Response && iRes.ok ? await iRes.json() : null
      const customer = cRes instanceof Response && cRes.ok ? await cRes.json() : null
      const data = buildExportData({ ...receipt, invoice, customer })
      const filename = `Receipt-${receipt.receiptNumber}`
      switch (type) {
        case 'excel': exportToExcel(data, filename); break
        case 'word': exportToWord(data, filename); break
        case 'pdf': exportToPDF(data, filename); break
      }
      toast({ title: "Export Successful", description: `Receipt exported to ${type.toUpperCase()} successfully` })
    } catch {
      toast({ title: "Export Failed", description: "Failed to export receipt.", variant: "destructive" })
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [rRes, iRes, cRes] = await Promise.all([
        fetch('/api/receipts'),
        fetch('/api/invoices'),
        fetch('/api/customers'),
      ])
      if (!rRes.ok) throw new Error('Failed to load')
      const allReceipts = await rRes.json()
      const invoices = iRes.ok ? await iRes.json() : []
      const customers = cRes.ok ? await cRes.json() : []
      const iMap = new Map((invoices || []).map((i: Invoice) => [i.id, i]))
      const cMap = new Map((customers || []).map((c: Customer) => [c.id, c]))
      setReceipts((allReceipts || []).map((r: Receipt) => ({
        ...r,
        invoice: iMap.get(r.invoiceId),
        customer: cMap.get(r.customerId),
      })))
    } catch (e) {
      console.error(e)
      setReceipts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this receipt?")) return
    try {
      const res = await fetch(`/api/receipts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      await loadData()
    } catch (e) {
      console.error(e)
      alert('Failed to delete receipt.')
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "issued":
        return "success"
      case "draft":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Cash"
      case "bank_transfer":
        return "Bank Transfer"
      case "cheque":
        return "Cheque"
      case "credit_card":
        return "Credit Card"
      default:
        return "Other"
    }
  }

  const filteredReceipts = receipts.filter((receipt) => {
    const matchesSearch =
      receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.invoice?.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.referenceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || receipt.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const totalAmount = filteredReceipts.reduce((sum, r) => sum + r.amount, 0)

  return (
    <div className="space-y-8">
      <PageHeader
        title="Receipts"
        description="Manage payment receipts"
        actionLabel={canEdit('receipts') ? "New Receipt" : undefined}
        actionHref={canEdit('receipts') ? "/receipts/new" : undefined}
      />

      <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
        <div className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by receipt number, invoice, customer, or reference..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2 border-blue-400 dark:border-blue-800/60"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 border-2 border-blue-400 dark:border-blue-800/60">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredReceipts.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 via-gold/10 to-blue-50 dark:from-blue-900/50 dark:via-gold/20 dark:to-blue-900/50 p-4 rounded-lg border-2 border-gold/40 dark:border-gold/30 shadow-gold">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-blue-900 dark:text-blue-100">Total Receipts Amount:</span>
                <span className="text-2xl font-bold text-gold dark:text-yellow-400">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-b-0">
              <TableHead className="font-bold text-white">Receipt Number</TableHead>
              <TableHead className="font-bold text-white">Invoice</TableHead>
              <TableHead className="font-bold text-white">Customer</TableHead>
              <TableHead className="font-bold text-white">Date</TableHead>
              <TableHead className="font-bold text-white">Payment Method</TableHead>
              <TableHead className="font-bold text-white">Amount</TableHead>
              <TableHead className="font-bold text-white">Status</TableHead>
              <TableHead className="text-right font-bold text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReceipts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center gap-3">
                    <ReceiptIcon className="h-12 w-12 text-gray-400 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-300 font-medium">No receipts found</p>
                    <Link href="/receipts/new">
                      <Button variant="gold" className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-6 py-3">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Receipt
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredReceipts.map((receipt) => (
                <TableRow key={receipt.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/50 border-b border-blue-100 dark:border-blue-800">
                  <TableCell className="font-semibold text-blue-900 dark:text-blue-100">
                    {receipt.receiptNumber}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/invoices/${receipt.invoiceId}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-medium"
                    >
                      {receipt.invoice?.invoiceNumber || "N/A"}
                    </Link>
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{receipt.customer?.name || "N/A"}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{formatDate(receipt.date)}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{getPaymentMethodLabel(receipt.paymentMethod)}</TableCell>
                  <TableCell className="font-semibold text-blue-900 dark:text-blue-100">
                    {formatCurrency(receipt.amount)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(receipt.status)} className="font-semibold">
                      {receipt.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/receipts/${receipt.id}`)}
                        className="hover:bg-blue-100 hover:text-blue-700"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit('receipts') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/receipts/${receipt.id}/edit`)}
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
                          <DropdownMenuItem onClick={() => handleExportReceipt(receipt.id, 'excel')}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Excel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportReceipt(receipt.id, 'word')}>
                            <FileText className="mr-2 h-4 w-4" />
                            Word
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportReceipt(receipt.id, 'pdf')}>
                            <File className="mr-2 h-4 w-4" />
                            PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {canDelete('receipts') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(receipt.id)}
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
