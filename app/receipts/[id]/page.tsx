"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, Download } from "lucide-react"
import { Receipt } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { PageHeader } from "@/components/shared/PageHeader"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { DocumentTimeline } from "@/components/shared/DocumentTimeline"
import { ExportButton } from "@/components/shared/ExportButton"
import { ExportData } from "@/lib/utils/export-utils"

export default function ReceiptDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canEdit } = usePermissions()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [invoice, setInvoice] = useState<any>(null)
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null)
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
        const rcpRes = await fetch(`/api/receipts/${id}`)
        const rcp = rcpRes.ok ? await rcpRes.json() : null
        if (!rcp || cancelled) {
          if (!cancelled) setReceipt(null)
          return
        }
        const [invRes, customersRes, posRes, quotationsRes] = await Promise.all([
          fetch(`/api/invoices/${rcp.invoiceId}`),
          fetch('/api/customers'),
          fetch('/api/purchase-orders'),
          fetch('/api/quotations'),
        ])
        if (cancelled) return
        const inv = invRes.ok ? await invRes.json() : null
        const customers = customersRes.ok ? await customersRes.json() : []
        const purchaseOrders = posRes.ok ? await posRes.json() : []
        const quotations = quotationsRes.ok ? await quotationsRes.json() : []
        const customer = (customers || []).find((c: any) => c.id === rcp.customerId)
        const po = inv?.purchaseOrderId ? (purchaseOrders || []).find((p: any) => p.id === inv.purchaseOrderId) : null
        const q = (po?.quotationId ? quotations.find((x: any) => x.id === po.quotationId) : null) ?? (inv?.quotationId ? quotations.find((x: any) => x.id === inv.quotationId) : null)
        if (!cancelled) {
          setInvoice(inv)
          setPurchaseOrder(po)
          setQuotation(q)
          setReceipt({ ...rcp, invoice: inv, customer })
        }
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
  if (!receipt) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Receipt not found</p>
      </div>
    )
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

  const getExportData = (): ExportData => {
    return {
      title: "PAYMENT RECEIPT",
      documentNumber: receipt.receiptNumber,
      date: receipt.date,
      customer: receipt.customer ? {
        name: receipt.customer.name,
        email: receipt.customer.email,
        phone: receipt.customer.phone,
        address: receipt.customer.address,
      } : undefined,
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
        "Payment Method": getPaymentMethodLabel(receipt.paymentMethod),
        "Reference Number": receipt.referenceNumber,
        "Bank Name": receipt.bankName,
        "Status": receipt.status,
      },
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Receipt ${receipt.receiptNumber}`}
        description="View receipt details"
        actionLabel={canEdit('receipts') ? "Edit Receipt" : undefined}
        actionHref={canEdit('receipts') ? `/receipts/${receipt.id}/edit` : undefined}
      />

      {/* Document Timeline */}
      <DocumentTimeline
        quotation={quotation && quotation.id ? {
          id: quotation.id,
          quotationNumber: quotation.quotationNumber,
          date: quotation.date,
          status: quotation.status,
        } : undefined}
        purchaseOrder={purchaseOrder && purchaseOrder.id ? {
          id: purchaseOrder.id,
          orderNumber: purchaseOrder.orderNumber,
          date: purchaseOrder.date,
          status: purchaseOrder.status,
        } : undefined}
        invoice={invoice && invoice.id ? {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date,
          status: invoice.status,
        } : undefined}
        receipts={[{
          id: receipt.id,
          receiptNumber: receipt.receiptNumber,
          date: receipt.date,
          amount: receipt.amount,
        }]}
        currentDocumentType="receipt"
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Receipt Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="font-semibold text-blue-900 dark:text-blue-100">Receipt Number:</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">{receipt.receiptNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="font-semibold text-blue-900 dark:text-blue-100">Date:</span>
              <span className="text-gray-700 dark:text-gray-300">{formatDate(receipt.date)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="font-semibold text-blue-900 dark:text-blue-100">Payment Date:</span>
              <span className="text-gray-700 dark:text-gray-300">{formatDate(receipt.paymentDate)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="font-semibold text-blue-900 dark:text-blue-100">Status:</span>
              <Badge variant={getStatusBadgeVariant(receipt.status)} className="font-semibold">
                {receipt.status}
              </Badge>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="font-semibold text-blue-900 dark:text-blue-100">Payment Method:</span>
              <span className="text-gray-700 dark:text-gray-300">{getPaymentMethodLabel(receipt.paymentMethod)}</span>
            </div>
            {receipt.referenceNumber && (
              <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
                <span className="font-semibold text-blue-900 dark:text-blue-100">Reference Number:</span>
                <span className="text-gray-700 dark:text-gray-300">{receipt.referenceNumber}</span>
              </div>
            )}
            {receipt.bankName && (
              <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
                <span className="font-semibold text-blue-900 dark:text-blue-100">Bank Name:</span>
                <span className="text-gray-700 dark:text-gray-300">{receipt.bankName}</span>
              </div>
            )}
            {receipt.paymentImageUrl && (
              <div className="pt-4 border-t border-blue-100 dark:border-blue-800">
                <span className="font-semibold text-blue-900 dark:text-blue-100 block mb-2">Payment Proof:</span>
                <div className="relative inline-block">
                  <img
                    src={receipt.paymentImageUrl}
                    alt="Payment proof"
                    className="max-w-full h-auto max-h-96 rounded-lg border-2 border-blue-400 dark:border-blue-800/60 dark:border-blue-800/60 cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(receipt.paymentImageUrl, '_blank')}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-gold/60 dark:border-gold/40 shadow-gold hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-gold/10 to-yellow-50 dark:from-gold/20 dark:to-blue-900/30">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Invoice & Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="font-semibold text-blue-900 dark:text-blue-100">Invoice:</span>
              <Button
                variant="link"
                onClick={() => router.push(`/invoices/${receipt.invoiceId}`)}
                className="text-gold dark:text-yellow-400 hover:text-gold-dark dark:hover:text-yellow-300 font-semibold ml-2"
              >
                {receipt.invoice?.invoiceNumber || "N/A"}
              </Button>
            </div>
            <div>
              <span className="font-semibold text-blue-900 dark:text-blue-100">Customer:</span>
              <p className="mt-1 text-gray-700 dark:text-gray-300">{receipt.customer?.name || "N/A"}</p>
            </div>
            {receipt.invoice && (
              <>
                <div className="flex justify-between py-2 border-t border-gold/30 dark:border-gold/40 pt-4">
                  <span className="font-semibold text-blue-900 dark:text-blue-100">Invoice Total:</span>
                  <span className="font-bold text-gray-700 dark:text-gray-300">{formatCurrency(receipt.invoice.total)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="font-semibold text-blue-900 dark:text-blue-100">Paid Amount:</span>
                  <span className="font-bold text-gold dark:text-yellow-400">{formatCurrency(receipt.invoice.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between py-2 border-t border-gold/30 dark:border-gold/40 pt-4">
                  <span className="font-semibold text-blue-900 dark:text-blue-100">Remaining:</span>
                  <span className="font-bold text-red-600 dark:text-red-400">
                    {formatCurrency(receipt.invoice.total - (receipt.invoice.paidAmount || 0))}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {receipt.notes && (
        <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 dark:text-gray-300">{receipt.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="bg-gradient-to-r from-gold/20 via-yellow-50 to-gold/20 dark:from-gold/30 dark:via-blue-900/30 dark:to-gold/30 p-6 rounded-lg border-2 border-gold/60 dark:border-gold/40 shadow-gold hover:shadow-lg transition-all duration-300">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">Amount Received</p>
          <p className="text-4xl font-bold text-gold dark:text-yellow-400">{formatCurrency(receipt.amount)}</p>
        </div>
      </div>

      <div className="flex gap-4 justify-end">
        <ExportButton
          data={getExportData()}
          filename={`Receipt-${receipt.receiptNumber}`}
          variant="outline"
        />
        {canEdit('receipts') && (
          <Button
            variant="gold"
            onClick={() => router.push(`/receipts/${receipt.id}/edit`)}
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-6 py-3"
          >
            <Edit className="mr-2 h-5 w-5" />
            Edit Receipt
          </Button>
        )}
      </div>
    </div>
  )
}
