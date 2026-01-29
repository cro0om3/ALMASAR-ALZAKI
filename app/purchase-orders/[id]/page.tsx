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
import Link from "next/link"
import { Edit, Receipt } from "lucide-react"
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params.id as string
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    const load = async () => {
      try {
        const [poRes, vendorsRes, customersRes, quotationsRes, invoicesRes] = await Promise.all([
          fetch(`/api/purchase-orders/${id}`),
          fetch('/api/vendors'),
          fetch('/api/customers'),
          fetch('/api/quotations'),
          fetch('/api/invoices'),
        ])
        if (cancelled) return
        const po = poRes.ok ? await poRes.json() : null
        const vendors = vendorsRes.ok ? await vendorsRes.json() : []
        const customers = customersRes.ok ? await customersRes.json() : []
        const quotations = quotationsRes.ok ? await quotationsRes.json() : []
        const invoices = invoicesRes.ok ? await invoicesRes.json() : []
        if (po) {
          const vendor = (vendors || []).find((v: any) => v.id === po.vendorId)
          const customer = (customers || []).find((c: any) => c.id === po.customerId)
          const q = (quotations || []).find((q: any) => q.id === po.quotationId)
          const invoice = (invoices || []).find((inv: any) => inv.purchaseOrderId === id)
          if (!cancelled) {
            setQuotation(q)
            setRelatedInvoice(invoice)
            setOrder({ ...po, vendor, customer })
          }
        } else if (!cancelled) setOrder(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }
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
        secondaryActionLabel={!relatedInvoice ? "Create Invoice" : undefined}
        secondaryActionHref={!relatedInvoice ? `/invoices/new?fromPO=${order.id}` : undefined}
        secondaryActionIcon={!relatedInvoice ? <Receipt className="mr-2 h-4 w-4" /> : undefined}
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
        hideNextStepButton
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-blue-400 dark:border-blue-800/60">
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

      <Card className="border-2 border-blue-400 dark:border-blue-800/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Items</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-b-0">
                <TableHead className="font-bold text-white">Description</TableHead>
                <TableHead className="font-bold text-white">Quantity</TableHead>
                <TableHead className="font-bold text-white">Unit Price</TableHead>
                <TableHead className="font-bold text-white">Tax</TableHead>
                <TableHead className="text-right font-bold text-white">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
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
            <Card className="border-2 border-blue-400 dark:border-blue-800/60">
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

      {/* Action Buttons - Edit and Export at bottom (same as Quotation page) */}
      <div className="flex gap-4 justify-end flex-wrap">
        {canEdit('purchase_orders') && (
          <Link href={`/purchase-orders/${order.id}/edit`}>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold px-6 py-3"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        )}
        <ExportButton
          data={getExportData()}
          filename={`PurchaseOrder-${order.orderNumber}`}
          variant="outline"
        />
      </div>
    </div>
  )
}
