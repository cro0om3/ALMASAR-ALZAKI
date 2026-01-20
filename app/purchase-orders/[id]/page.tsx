"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, ArrowLeft, Download, Receipt } from "lucide-react"
import { purchaseOrderService } from "@/lib/data"
import { vendorService, customerService, invoiceService, quotationService } from "@/lib/data"
import { PurchaseOrder } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { DocumentTimeline } from "@/components/shared/DocumentTimeline"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { PageHeader } from "@/components/shared/PageHeader"
import { ExportButton } from "@/components/shared/ExportButton"
import { ExportData } from "@/lib/utils/export-utils"

export default function PurchaseOrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canEdit } = usePermissions()
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [relatedInvoice, setRelatedInvoice] = useState<any>(null)
  const [quotation, setQuotation] = useState<any>(null)

  useEffect(() => {
    const id = params.id as string
    const po = purchaseOrderService.getById(id)
    if (po) {
      const vendor = po.vendorId ? vendorService.getById(po.vendorId) : undefined
      const customer = po.customerId ? customerService.getById(po.customerId) : undefined
      const q = po.quotationId ? quotationService.getById(po.quotationId) : undefined
      
      // Find related invoice by purchaseOrderId
      const allInvoices = invoiceService.getAll()
      const invoice = allInvoices.find(inv => inv.purchaseOrderId === id)
      
      setQuotation(q)
      setRelatedInvoice(invoice)
      setOrder({ ...po, vendor, customer })
    }
  }, [params.id])

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Purchase order not found</p>
      </div>
    )
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

  const getExportData = (): ExportData => {
    return {
      title: "Purchase Order",
      documentNumber: order.orderNumber,
      date: order.date,
      customer: order.customer ? {
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        address: order.customer.address,
      } : order.vendor ? {
        name: order.vendor.name,
        email: order.vendor.email,
        phone: order.vendor.phone,
        address: order.vendor.address,
      } : undefined,
      items: order.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        total: item.total,
      })),
      subtotal: order.subtotal,
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
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Purchase Order ${order.orderNumber}`}
        description="View purchase order details"
        actionLabel={canEdit('purchase_orders') ? "Edit" : undefined}
        actionHref={canEdit('purchase_orders') ? `/purchase-orders/${order.id}/edit` : undefined}
        actionIcon={canEdit('purchase_orders') ? <Edit className="mr-2 h-4 w-4" /> : undefined}
      />

      {/* Document Timeline */}
      <DocumentTimeline
        quotation={quotation ? {
          id: quotation.id,
          quotationNumber: quotation.quotationNumber,
          date: quotation.date,
          status: quotation.status,
        } : undefined}
        purchaseOrder={{
          id: order.id,
          orderNumber: order.orderNumber,
          date: order.date,
          status: order.status,
        }}
        invoice={relatedInvoice ? {
          id: relatedInvoice.id,
          invoiceNumber: relatedInvoice.invoiceNumber,
          date: relatedInvoice.date,
          status: relatedInvoice.status,
        } : undefined}
        onQuickConvert={(type, fromId) => {
          if (type === 'invoice') {
            router.push(`/invoices/new?fromPO=${fromId || order.id}`)
          }
        }}
        currentDocumentType="purchase_order"
      />

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Button 
          variant="gold"
          onClick={() => router.push(`/invoices/new?fromPO=${order.id}`)}
          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-6 py-3"
        >
          <Receipt className="mr-2 h-5 w-5" />
          Create Invoice
        </Button>
        <ExportButton
          data={getExportData()}
          filename={`PurchaseOrder-${order.orderNumber}`}
          variant="outline"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-blue-200/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">{order.customerId ? "Customer Information" : "Vendor Information"}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {order.customerId ? (
              <>
                <p className="text-gray-700 dark:text-gray-300"><strong>Name:</strong> {order.customer?.name || "N/A"}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> {order.customer?.email || "N/A"}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Phone:</strong> {order.customer?.phone || "N/A"}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Address:</strong> {order.customer?.address || "N/A"}</p>
              </>
            ) : (
              <>
                <p className="text-gray-700 dark:text-gray-300"><strong>Name:</strong> {order.vendor?.name || "N/A"}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Email:</strong> {order.vendor?.email || "N/A"}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Phone:</strong> {order.vendor?.phone || "N/A"}</p>
                <p className="text-gray-700 dark:text-gray-300"><strong>Contact Person:</strong> {order.vendor?.contactPerson || "N/A"}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-gold/60">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-gold to-gold-dark rounded-full"></div>
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Order Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-gray-700 dark:text-gray-300"><strong>Date:</strong> {formatDate(order.date)}</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>Expected Delivery:</strong> {formatDate(order.expectedDelivery)}</p>
            <p className="text-gray-700 dark:text-gray-300"><strong>Status:</strong>{" "}
              <Badge variant={getStatusBadgeVariant(order.status)}>
                {order.status}
              </Badge>
            </p>
            {order.quotationId && quotation && (
              <p className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <strong className="text-gray-700 dark:text-gray-300">Linked Quotation:</strong>{" "}
                <Button
                  variant="link"
                  onClick={() => router.push(`/quotations/${order.quotationId}`)}
                  className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-semibold p-0 h-auto"
                >
                  {quotation.quotationNumber}
                </Button>
              </p>
            )}
            {relatedInvoice && (
              <p className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <strong className="text-gray-700 dark:text-gray-300">Linked Invoice:</strong>{" "}
                <Button
                  variant="link"
                  onClick={() => router.push(`/invoices/${relatedInvoice.id}`)}
                  className="text-gold dark:text-yellow-400 hover:text-gold-dark dark:hover:text-yellow-300 font-semibold p-0 h-auto"
                >
                  {relatedInvoice.invoiceNumber}
                </Button>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-blue-200/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Items</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell>{item.discount}%</TableCell>
                  <TableCell>{item.tax}%</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-700 dark:text-gray-300">
                <span>Tax ({order.taxRate}%):</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200 dark:border-gray-700 text-blue-900 dark:text-blue-100">
                <span>Total:</span>
                <span className="text-gold dark:text-yellow-400">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {(order.terms || order.notes) && (
        <div className="grid gap-6 md:grid-cols-2">
          {order.terms && (
            <Card className="border-2 border-blue-200/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
                  <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Terms & Conditions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{order.terms}</p>
              </CardContent>
            </Card>
          )}
          {order.notes && (
            <Card className="border-2 border-gold/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-gold to-gold-dark rounded-full"></div>
                  <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Notes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{order.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
