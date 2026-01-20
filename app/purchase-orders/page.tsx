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
import { Plus, Search, Eye, Edit, Trash2, ShoppingCart, Receipt } from "lucide-react"
import { purchaseOrderService } from "@/lib/data"
import { vendorService, customerService } from "@/lib/data"
import { PurchaseOrder } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()

  useEffect(() => {
    const loadOrders = () => {
      const allOrders = purchaseOrderService.getAll()
      const ordersWithVendors = allOrders.map(po => ({
        ...po,
        vendor: po.vendorId ? vendorService.getById(po.vendorId) : undefined,
        customer: po.customerId ? customerService.getById(po.customerId) : undefined,
      }))
      setOrders(ordersWithVendors)
    }
    loadOrders()
  }, [])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this purchase order?")) {
      purchaseOrderService.delete(id)
      const allOrders = purchaseOrderService.getAll()
      const ordersWithDetails = allOrders.map(po => ({
        ...po,
        vendor: po.vendorId ? vendorService.getById(po.vendorId) : undefined,
        customer: po.customerId ? customerService.getById(po.customerId) : undefined,
      }))
      setOrders(ordersWithDetails)
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
          className="h-12 rounded-lg border-2 border-blue-200/60 dark:border-blue-800/60 bg-white dark:bg-blue-900 px-4 py-2 text-sm font-semibold text-blue-900 dark:text-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-all"
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

      <Card className="border-2 border-blue-200/60 shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/50 dark:to-blue-800/50 border-b-2 border-blue-200 dark:border-blue-800">
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Order Number</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Vendor</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Date</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Expected Delivery</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Total</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Status</TableHead>
              <TableHead className="text-right font-bold text-blue-900 dark:text-blue-100">Actions</TableHead>
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
      </Card>
    </div>
  )
}
