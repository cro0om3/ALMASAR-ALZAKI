"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Edit, ShoppingCart, Loader2, FileText } from "lucide-react"
import Link from "next/link"
import { Quotation, PurchaseOrder } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { COMPANY_INFO } from "@/lib/config"
import { PageHeader } from "@/components/shared/PageHeader"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { DocumentTimeline } from "@/components/shared/DocumentTimeline"
import { ExportButton } from "@/components/shared/ExportButton"
import { ExportData } from "@/lib/utils/export-utils"
import { EmptyState } from "@/components/shared/EmptyState"

export default function QuotationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canEdit } = usePermissions()
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [relatedPOs, setRelatedPOs] = useState<PurchaseOrder[]>([])
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
        const [qRes, poRes] = await Promise.all([
          fetch(`/api/quotations/${id}`),
          fetch('/api/purchase-orders'),
        ])
        if (cancelled) return
        const q = qRes.ok ? await qRes.json() : null
        const allPOs = poRes.ok ? await poRes.json() : []
        if (!q) {
          setQuotation(null)
          setRelatedPOs([])
          return
        }
        setRelatedPOs((allPOs || []).filter((po: PurchaseOrder) => po.quotationId === q.id))
        const cRes = await fetch(`/api/customers/${q.customerId}`)
        const customer = cRes.ok ? await cRes.json() : null
        if (!cancelled) setQuotation({ ...q, customer: customer ?? undefined })
      } catch {
        if (!cancelled) setQuotation(null)
        setRelatedPOs([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [params.id])

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

  const hasHours = useMemo(() => quotation?.items.some(item => item.hours) ?? false, [quotation])
  const hasDays = useMemo(() => quotation?.items.some(item => item.days) ?? false, [quotation])
  const hasQuantity = useMemo(() => quotation?.items.some(item => !item.hours && !item.days) ?? false, [quotation])

  const tableColSpan = useMemo(() => {
    if (!quotation) return 0
    return 1 + // Description
      (hasHours ? 1 : 0) + // Hours (if exists)
      (hasDays ? 1 : 0) + // Days (if exists)
      (hasQuantity ? 1 : 0) + // Quantity (if exists)
      1 + // Unit Price
      1 // Tax
  }, [quotation, hasHours, hasDays, hasQuantity])

  const getExportData = useMemo((): ExportData => {
    if (!quotation) {
      return {
        title: "Quotation",
        documentNumber: "",
        date: "",
        items: [],
        subtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        total: 0,
      }
    }

    return {
      title: "Quotation",
      documentNumber: quotation.quotationNumber,
      date: quotation.date,
      customer: quotation.customer ? {
        name: quotation.customer.name,
        email: quotation.customer.email,
        phone: quotation.customer.phone,
        address: quotation.customer.address,
      } : undefined,
      items: quotation.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        hours: item.hours,
        days: item.days,
        unitPrice: item.unitPrice,
        tax: item.tax,
        total: item.total,
        vehicleNumber: 'vehicleNumber' in item ? (item as { vehicleNumber?: string }).vehicleNumber : undefined,
      })),
      subtotal: quotation.subtotal,
      taxRate: quotation.taxRate,
      taxAmount: quotation.taxAmount,
      total: quotation.total,
      terms: quotation.terms,
      notes: quotation.notes,
      additionalFields: {
        "Valid Until": formatDate(quotation.validUntil),
        "Status": quotation.status,
      },
    }
  }, [quotation])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-8">
        <div className="text-center space-y-6 max-w-md">
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <FileText className="h-16 w-16 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                Quotation not found
              </h2>
              <p className="text-muted-foreground mb-2">
                The quotation you&apos;re looking for doesn&apos;t exist or may have been deleted.
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ID: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{params.id}</code>
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button 
              onClick={() => router.push('/quotations')} 
              variant="outline"
              className="border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900"
            >
              Back to Quotations
            </Button>
            <Button 
              onClick={() => router.push('/quotations/new')} 
              variant="default"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Create New Quotation
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Quotation ${quotation.quotationNumber}`}
        description="View quotation details"
        secondaryActionLabel={relatedPOs.length === 0 ? "Create Purchase Order" : undefined}
        secondaryActionHref={relatedPOs.length === 0 ? `/purchase-orders/new?fromQuotation=${quotation.id}` : undefined}
        secondaryActionIcon={relatedPOs.length === 0 ? <ShoppingCart className="mr-2 h-4 w-4" /> : undefined}
      />

      {/* Document Timeline */}
      <DocumentTimeline
        quotation={{
          id: quotation.id,
          quotationNumber: quotation.quotationNumber,
          date: quotation.date,
          status: quotation.status,
        }}
        purchaseOrder={relatedPOs[0] ? {
          id: relatedPOs[0].id,
          orderNumber: relatedPOs[0].orderNumber,
          date: relatedPOs[0].date,
          status: relatedPOs[0].status,
        } : undefined}
        onQuickConvert={(type, fromId) => {
          if (type === 'po') {
            router.push(`/purchase-orders/new?fromQuotation=${fromId || quotation.id}`)
          }
        }}
        currentDocumentType="quotation"
      />

      {/* QUOTATION Display - Professional Format */}
      <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-blue-300 dark:border-blue-700">
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">QUOTATION</h1>
          </div>

          {/* From Company / To Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border-2 border-blue-400 dark:border-blue-800 p-4 rounded-lg bg-white dark:bg-blue-900/30">
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 pb-2 border-b border-blue-400 dark:border-blue-800">From</h3>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>{COMPANY_INFO.name}</strong></p>
                <p>Trade License: {COMPANY_INFO.tradeLicense}</p>
                <p>Tax Reg. No. (TRN): {COMPANY_INFO.taxRegNumber}</p>
                <p>Tel: {COMPANY_INFO.phone}</p>
                <p>P.O.Box: {COMPANY_INFO.poBox} {COMPANY_INFO.address}</p>
                <p>E-Mail: {COMPANY_INFO.email}</p>
              </div>
            </div>

            <div className="border-2 border-gold/60 dark:border-gold/40 p-4 rounded-lg bg-white dark:bg-blue-900/30">
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 pb-2 border-b border-gold/60 dark:border-gold/40">To Customer</h3>
              <div className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                <p><strong>{quotation.customer?.name || "N/A"}</strong></p>
                {quotation.customer?.email && <p>E-Mail: {quotation.customer.email}</p>}
                {quotation.customer?.phone && <p>Tel: {quotation.customer.phone}</p>}
                {quotation.customer?.address && <p>Address: {quotation.customer.address}</p>}
              </div>
            </div>
          </div>

          {/* Quotation Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="font-semibold text-blue-900 dark:text-blue-100">Quotation Date:</span>
              <span className="text-gray-700 dark:text-gray-300">{formatDate(quotation.date)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="font-semibold text-blue-900 dark:text-blue-100">Quotation No.:</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">{quotation.quotationNumber}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="font-semibold text-blue-900 dark:text-blue-100">Valid Until:</span>
              <span className="text-gray-700 dark:text-gray-300">{formatDate(quotation.validUntil)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="font-semibold text-blue-900 dark:text-blue-100">Status:</span>
              <Badge variant={getStatusBadgeVariant(quotation.status)} className="font-semibold">
                {quotation.status}
              </Badge>
            </div>
            {quotation.billingType && (
              <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
                <span className="font-semibold text-blue-900 dark:text-blue-100">Billing Type:</span>
                <span className="capitalize text-gray-700 dark:text-gray-300">{quotation.billingType}</span>
              </div>
            )}
          </div>

          {/* Quotation Items Table */}
          <div className="overflow-x-auto mb-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-b-0">
                  <TableHead className="font-bold text-white">Description</TableHead>
                  {hasHours && (
                    <TableHead className="font-bold text-white">Hours</TableHead>
                  )}
                  {hasDays && (
                    <TableHead className="font-bold text-white">Days</TableHead>
                  )}
                  {hasQuantity && (
                    <TableHead className="font-bold text-white">Quantity</TableHead>
                  )}
                  <TableHead className="font-bold text-white">Unit Price</TableHead>
                  <TableHead className="font-bold text-white">Tax %</TableHead>
                  <TableHead className="font-bold text-white text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotation.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={tableColSpan + 1} className="text-center py-8 text-gray-500 dark:text-gray-300">
                      No items in this quotation
                    </TableCell>
                  </TableRow>
                ) : (
                  <>
                    {quotation.items.map((item, index) => (
                      <TableRow key={item.id || index} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800">
                        <TableCell className="font-medium text-gray-700 dark:text-gray-300">{item.description}</TableCell>
                        {hasHours && (
                          <TableCell className="text-gray-600 dark:text-gray-200">
                            {item.hours ? `${item.hours.toFixed(2)} hrs` : '-'}
                          </TableCell>
                        )}
                        {hasDays && (
                          <TableCell className="text-gray-600 dark:text-gray-200">
                            {item.days ? `${item.days} days` : '-'}
                          </TableCell>
                        )}
                        {hasQuantity && (
                          <TableCell className="text-gray-600 dark:text-gray-200">{item.quantity}</TableCell>
                        )}
                        <TableCell className="text-gray-600 dark:text-gray-200">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-200">{item.tax}%</TableCell>
                        <TableCell className="text-right font-semibold text-blue-900 dark:text-blue-100">{formatCurrency(item.total)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-blue-50 dark:bg-blue-900/50 font-bold border-t-2 border-blue-300 dark:border-blue-700">
                      <TableCell 
                        colSpan={tableColSpan}
                        className="font-bold text-blue-900 dark:text-blue-100"
                      >
                        Total
                      </TableCell>
                      <TableCell className="text-right font-bold text-gold dark:text-yellow-400 text-lg">{formatCurrency(quotation.total)}</TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
          </div>

              {/* Summary */}
              <div className="mt-6 flex justify-end">
                <div className="w-80 space-y-3 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/50 dark:to-blue-950 p-6 rounded-xl border-2 border-blue-400 dark:border-blue-800/60 dark:border-blue-800/60">
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span className="font-medium">Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(quotation.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700 dark:text-gray-300">
                    <span className="font-medium">VAT ({quotation.taxRate}%):</span>
                    <span className="font-semibold">{formatCurrency(quotation.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-xl pt-3 border-t-2 border-blue-400 dark:border-blue-700 text-blue-900 dark:text-blue-100">
                    <span>Total:</span>
                    <span className="text-gold dark:text-yellow-400">{formatCurrency(quotation.total)}</span>
                  </div>
                </div>
              </div>
        </CardContent>
      </Card>

      {/* Related Purchase Orders */}
      {relatedPOs.length > 0 && (
        <Card className="border-2 border-blue-400 dark:border-blue-800/60">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Related Purchase Orders</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {relatedPOs.map((po) => (
                    <Link key={po.id} href={`/purchase-orders/${po.id}`}>
                      <div className="p-4 border-2 border-blue-400 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold text-blue-900 dark:text-blue-100">{po.orderNumber}</span>
                          </div>
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{formatCurrency(po.total)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                          <span>{formatDate(po.date)}</span>
                          <Badge variant={po.status === 'received' ? 'success' : po.status === 'approved' ? 'success' : 'default'}>
                            {po.status}
                          </Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Terms & Notes Section */}
          {(quotation.terms || quotation.notes) && (
            <div className="grid gap-6 md:grid-cols-2">
              {quotation.terms && (
                <Card className="border-2 border-blue-400 dark:border-blue-800/60">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
                      <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Terms & Conditions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{quotation.terms}</p>
                  </CardContent>
                </Card>
              )}
              {quotation.notes && (
                <Card className="border-2 border-gold/60">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-gold to-gold-dark rounded-full"></div>
                      <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Notes</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">{quotation.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

      {/* Action Buttons - Edit and Export at bottom right */}
      <div className="flex gap-4 justify-end flex-wrap">
        {quotation.status === 'accepted' && relatedPOs.length === 0 && (
          <Button
            variant="gold"
            onClick={() => router.push(`/purchase-orders/new?fromQuotation=${quotation.id}`)}
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-6 py-3"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Create Purchase Order
          </Button>
        )}
        {canEdit('quotations') && (
          <Link href={`/quotations/${quotation.id}/edit`}>
            <Button
              variant="gold"
              size="lg"
              className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-6 py-3"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        )}
        <ExportButton
          data={getExportData}
          filename={`Quotation-${quotation.quotationNumber}`}
          variant="gold"
        />
      </div>
    </div>
  )
}
