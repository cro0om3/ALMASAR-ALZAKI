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
import { Plus, Search, Eye, Edit, Trash2, ShoppingCart, Receipt, Download, FileSpreadsheet, FileText, File } from "lucide-react"
import { PurchaseOrder } from "@/types"
import type { Vendor, Customer } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { exportToExcel, exportToWord, exportToPDF, ExportData } from "@/lib/utils/export-utils"
import { useToast } from "@/lib/hooks/use-toast"

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<(PurchaseOrder & { vendor?: Vendor; customer?: Customer })[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()
  const { toast } = useToast()

  const buildExportData = (order: PurchaseOrder & { vendor?: Vendor; customer?: Customer }, vendor: Vendor | null, customer: Customer | null): ExportData => ({
    title: "Purchase Order",
    documentNumber: order.orderNumber,
    date: order.date,
    customer: customer ? { name: customer.name, email: customer.email, phone: customer.phone, address: customer.address } : vendor ? { name: vendor.name, email: vendor.email, phone: vendor.phone, address: vendor.address } : undefined,
    items: (order.items || []).map((item: any) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      tax: item.tax,
      total: item.total,
    })),
    subtotal: order.subtotal ?? 0,
    taxRate: order.taxRate,
    taxAmount: order.taxAmount,
    total: order.total,
    terms: order.terms,
    notes: order.notes,
    additionalFields: {
      "Expected Delivery": formatDate(order.expectedDelivery),
      "Status": order.status,
      "Type": order.customerId ? "Customer" : "Vendor",
    },
  })

  const handleExportPO = async (id: string, type: 'excel' | 'word' | 'pdf') => {
    try {
      const poRes = await fetch(`/api/purchase-orders/${id}`)
      if (!poRes.ok) throw new Error('Failed to load purchase order')
      const order = await poRes.json()
      const [vRes, cRes] = await Promise.all([
        order.vendorId ? fetch(`/api/vendors/${order.vendorId}`) : Promise.resolve({ ok: false }),
        order.customerId ? fetch(`/api/customers/${order.customerId}`) : Promise.resolve({ ok: false }),
      ])
      const vendor = vRes instanceof Response && vRes.ok ? await vRes.json() : null
      const customer = cRes instanceof Response && cRes.ok ? await cRes.json() : null
      const data = buildExportData({ ...order, vendor, customer }, vendor, customer)
      const filename = `PurchaseOrder-${order.orderNumber}`
      switch (type) {
        case 'excel': exportToExcel(data, filename); break
        case 'word': exportToWord(data, filename); break
        case 'pdf': exportToPDF(data, filename); break
      }
      toast({ title: "Export Successful", description: `Purchase order exported to ${type.toUpperCase()} successfully` })
    } catch {
      toast({ title: "Export Failed", description: "Failed to export purchase order.", variant: "destructive" })
    }
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const [poRes, vRes, cRes] = await Promise.all([
        fetch('/api/purchase-orders'),
        fetch('/api/vendors'),
        fetch('/api/customers'),
      ])
      if (!poRes.ok) throw new Error('Failed to load')
      const allOrders = await poRes.json()
      const vendors = vRes.ok ? await vRes.json() : []
      const customers = cRes.ok ? await cRes.json() : []
      const vMap = new Map((vendors || []).map((v: Vendor) => [v.id, v]))
      const cMap = new Map((customers || []).map((c: Customer) => [c.id, c]))
      setOrders((allOrders || []).map((po: PurchaseOrder) => ({
        ...po,
        vendor: po.vendorId ? vMap.get(po.vendorId) : undefined,
        customer: po.customerId ? cMap.get(po.customerId) : undefined,
      })))
    } catch (e) {
      console.error(e)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this purchase order?")) return
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      await loadData()
    } catch (e) {
      console.error(e)
      alert('Failed to delete purchase order.')
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "approved":
        return "success"
      case "pending":
        return "default"
      case "rejected":
        return "destructive"
      case "completed":
        return "success"
      case "cancelled":
        return "warning"
      default:
        return "secondary"
    }
  }

  const filteredOrders = orders.filter((po) => {
    const matchesSearch =
      po.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendor?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.vendor?.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || po.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Purchase Orders"
        description="Manage your purchase orders"
        actionLabel={canEdit('purchase_orders') ? "New Purchase Order" : undefined}
        actionHref={canEdit('purchase_orders') ? "/purchase-orders/new" : undefined}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search purchase orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-base"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 rounded-lg border-2 border-blue-400 dark:border-blue-800/60 dark:border-blue-800/60 bg-white dark:bg-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
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
              <TableHead className="font-bold text-white">Order Number</TableHead>
              <TableHead className="font-bold text-white">Vendor</TableHead>
              <TableHead className="font-bold text-white">Date</TableHead>
              <TableHead className="font-bold text-white">Expected Delivery</TableHead>
              <TableHead className="font-bold text-white">Total</TableHead>
              <TableHead className="font-bold text-white">Status</TableHead>
              <TableHead className="text-right font-bold text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <ShoppingCart className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-300 font-medium text-lg">No purchase orders found</p>
                    <p className="text-gray-400 dark:text-gray-400 text-sm">Create your first purchase order to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/50 transition-colors border-b border-blue-100 dark:border-blue-800">
                  <TableCell className="font-semibold text-blue-900 dark:text-blue-100">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {order.vendor?.name || "Unknown Vendor"}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{formatDate(order.date)}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{formatDate(order.expectedDelivery)}</TableCell>
                  <TableCell className="font-semibold text-blue-900 dark:text-blue-100">{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)} className="font-semibold">
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/purchase-orders/${order.id}`)}
                        className="hover:bg-blue-100 hover:text-blue-700"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/invoices/new?fromPO=${order.id}`)}
                        className="hover:bg-yellow-100 hover:text-yellow-700"
                        title="Create Invoice"
                      >
                        <Receipt className="h-4 w-4" />
                      </Button>
                      {canEdit('purchase_orders') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/purchase-orders/${order.id}/edit`)}
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
                          <DropdownMenuItem onClick={() => handleExportPO(order.id, 'excel')}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Excel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportPO(order.id, 'word')}>
                            <FileText className="mr-2 h-4 w-4" />
                            Word
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportPO(order.id, 'pdf')}>
                            <File className="mr-2 h-4 w-4" />
                            PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {canDelete('purchase_orders') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(order.id)}
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
        )}
      </Card>
    </div>
  )
}
