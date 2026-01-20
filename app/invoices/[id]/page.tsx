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
import { Edit, ArrowLeft, Download, Receipt as ReceiptIcon, Plus } from "lucide-react"
import { invoiceService } from "@/lib/data"
import { customerService, purchaseOrderService, receiptService, quotationService } from "@/lib/data"
import { Invoice } from "@/types"
import { formatCurrency, formatDate, formatDateForInvoice, numberToWords } from "@/lib/utils"
import { COMPANY_INFO } from "@/lib/config"
import { PageHeader } from "@/components/shared/PageHeader"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { DocumentTimeline } from "@/components/shared/DocumentTimeline"
import { ExportButton } from "@/components/shared/ExportButton"
import { ExportData } from "@/lib/utils/export-utils"

export default function InvoiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canEdit } = usePermissions()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [quotation, setQuotation] = useState<any>(null)
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null)
  const [receipts, setReceipts] = useState<any[]>([])

  useEffect(() => {
    const id = params.id as string
    const inv = invoiceService.getById(id)
    if (inv) {
      const customer = customerService.getById(inv.customerId)
      const q = inv.quotationId ? quotationService.getById(inv.quotationId) : null
      const po = inv.purchaseOrderId ? purchaseOrderService.getById(inv.purchaseOrderId) : null
      const invoiceReceipts = receiptService.getByInvoiceId(id).map(r => ({
        ...r,
        customer: customerService.getById(r.customerId),
      }))
      setQuotation(q)
      setPurchaseOrder(po)
      setReceipts(invoiceReceipts)
      setInvoice({ ...inv, customer })
    }
  }, [params.id])

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Invoice not found</p>
      </div>
    )
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

  // Calculate gross amount and net amount for each item
  const calculateItemAmounts = (item: any) => {
    const hours = item.hours || 0
    const days = item.days || 0
    const quantity = item.quantity || 0
    
    let grossAmount = 0
    if (invoice.billingType === 'hours' && hours > 0) {
      grossAmount = hours * item.unitPrice
    } else if (invoice.billingType === 'days' && days > 0) {
      grossAmount = days * item.unitPrice
    } else {
      grossAmount = quantity * item.unitPrice
    }
    
    const discountAmount = (grossAmount * (item.discount || 0)) / 100
    const afterDiscount = grossAmount - discountAmount
    const vatAmount = (afterDiscount * (invoice.taxRate || 0)) / 100
    const netAmount = afterDiscount + vatAmount
    
    return { grossAmount, vatAmount, netAmount }
  }

  const handleDownload = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      const invoiceDate = formatDateForInvoice(invoice.date)
      const amountWords = invoice.amountInWords || numberToWords(invoice.total)
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>TAX INVOICE ${invoice.invoiceNumber}</title>
            <style>
              @media print {
                body { margin: 0; padding: 20px; }
              }
              body { 
                font-family: Arial, sans-serif; 
                padding: 20px; 
                max-width: 210mm;
                margin: 0 auto;
              }
              .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #333;
                padding-bottom: 20px;
              }
              .header h1 {
                font-size: 24px;
                font-weight: bold;
                margin: 10px 0;
              }
              .supplier-customer {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-bottom: 30px;
              }
              .section {
                border: 1px solid #ddd;
                padding: 15px;
              }
              .section h3 {
                margin-top: 0;
                margin-bottom: 10px;
                font-size: 14px;
                font-weight: bold;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
              }
              .section p {
                margin: 5px 0;
                font-size: 12px;
              }
              .invoice-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
              }
              .invoice-info-item {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                border-bottom: 1px solid #eee;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                font-size: 12px;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
              }
              th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              .total-row {
                font-weight: bold;
                background-color: #f9f9f9;
              }
              .amount-words {
                margin-top: 20px;
                padding: 10px;
                background-color: #f9f9f9;
                border: 1px solid #ddd;
              }
              .signature-section {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                margin-top: 40px;
              }
              .signature-box {
                border: 1px solid #ddd;
                padding: 20px;
                min-height: 100px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>TAX INVOICE</h1>
            </div>
            
            <div class="supplier-customer">
              <div class="section">
                <h3>From Supplier</h3>
                <p><strong>${COMPANY_INFO.name}</strong></p>
                <p>Trade License: ${COMPANY_INFO.tradeLicense}</p>
                <p>Tax Reg. No. (TRN): ${COMPANY_INFO.taxRegNumber}</p>
                <p>Tel: ${COMPANY_INFO.phone}</p>
                <p>P.O.Box: ${COMPANY_INFO.poBox} ${COMPANY_INFO.address}</p>
                <p>E-Mail: ${COMPANY_INFO.email}</p>
              </div>
              
              <div class="section">
                <h3>To Customer</h3>
                <p><strong>${invoice.customer?.name || "N/A"}</strong></p>
                ${invoice.customer?.email ? `<p>E-Mail: ${invoice.customer.email}</p>` : ''}
                ${invoice.customer?.phone ? `<p>Tel: ${invoice.customer.phone}</p>` : ''}
                ${invoice.customer?.address ? `<p>Address: ${invoice.customer.address}</p>` : ''}
              </div>
            </div>
            
            <div class="invoice-info">
              <div class="invoice-info-item">
                <span><strong>Tax Invoice Date:</strong></span>
                <span>${invoiceDate}</span>
              </div>
              <div class="invoice-info-item">
                <span><strong>Invoice No.:</strong></span>
                <span>${invoice.invoiceNumber}</span>
              </div>
              ${invoice.projectName ? `
              <div class="invoice-info-item">
                <span><strong>Project Name:</strong></span>
                <span>${invoice.projectName}</span>
              </div>
              ` : ''}
              ${invoice.lpoNumber ? `
              <div class="invoice-info-item">
                <span><strong>LPO No.:</strong></span>
                <span>${invoice.lpoNumber}</span>
              </div>
              ` : ''}
            </div>
            
            ${invoice.scopeOfWork ? `
            <div style="margin-bottom: 20px;">
              <p><strong>Scope of Work:</strong> ${invoice.scopeOfWork}</p>
            </div>
            ` : ''}
            
            <table>
              <thead>
                <tr>
                  <th>Good & Services Supplied</th>
                  ${invoice.billingType === 'hours' ? '<th>Vehicle#</th><th>Total hour</th>' : ''}
                  ${invoice.billingType === 'days' ? '<th>Vehicle#</th><th>Total Days</th>' : ''}
                  <th>Unit Price</th>
                  <th>Gross Amount AED</th>
                  <th>Vat (${invoice.taxRate}%)</th>
                  <th>Net Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => {
                  const { grossAmount, vatAmount, netAmount } = calculateItemAmounts(item)
                  return `
                    <tr>
                      <td>${item.description}</td>
                      ${invoice.billingType === 'hours' ? `<td>${item.vehicleNumber || '-'}</td><td>${item.hours || 0}</td>` : ''}
                      ${invoice.billingType === 'days' ? `<td>${item.vehicleNumber || '-'}</td><td>${item.days || 0}</td>` : ''}
                      <td>${formatCurrency(item.unitPrice)}</td>
                      <td>${formatCurrency(grossAmount)}</td>
                      <td>${formatCurrency(vatAmount)}</td>
                      <td>${formatCurrency(netAmount)}</td>
                    </tr>
                  `
                }).join("")}
                <tr class="total-row">
                  <td colspan="${invoice.billingType === 'hours' || invoice.billingType === 'days' ? '3' : '1'}"><strong>Net Payment Due for this Invoice</strong></td>
                  <td>${invoice.items.reduce((sum, item) => {
                    const hours = item.hours || 0
                    const days = item.days || 0
                    const quantity = item.quantity || 0
                    if (invoice.billingType === 'hours') return sum + hours
                    if (invoice.billingType === 'days') return sum + days
                    return sum + quantity
                  }, 0)}</td>
                  <td>${formatCurrency(invoice.items[0]?.unitPrice || 0)}</td>
                  <td>${formatCurrency(invoice.subtotal)}</td>
                  <td>${formatCurrency(invoice.taxAmount)}</td>
                  <td>${formatCurrency(invoice.total)}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="amount-words">
              <p><strong>Amount in Words:</strong> ${amountWords}</p>
            </div>
            
            <div class="signature-section">
              <div class="signature-box">
                <p><strong>For ${COMPANY_INFO.name}</strong></p>
                <br><br>
                <p>Sign & Stamp</p>
              </div>
              <div class="signature-box">
                <p><strong>${invoice.customer?.name || "Customer"}</strong></p>
                <br><br>
                <p>Sign & Stamp</p>
              </div>
            </div>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const amountWords = invoice.amountInWords || numberToWords(invoice.total)

  const getExportData = (): ExportData => {
    return {
      title: "TAX INVOICE",
      documentNumber: invoice.invoiceNumber,
      date: invoice.date,
      customer: invoice.customer ? {
        name: invoice.customer.name,
        email: invoice.customer.email,
        phone: invoice.customer.phone,
        address: invoice.customer.address,
      } : undefined,
      items: invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        hours: item.hours,
        days: item.days,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        total: item.total,
        vehicleNumber: item.vehicleNumber,
      })),
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      terms: invoice.terms,
      notes: invoice.notes,
      additionalFields: {
        "Due Date": formatDate(invoice.dueDate),
        "Status": invoice.status,
        "Project Name": invoice.projectName,
        "LPO Number": invoice.lpoNumber,
        "Scope of Work": invoice.scopeOfWork,
        "Amount in Words": amountWords,
      },
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Invoice ${invoice.invoiceNumber}`}
        description="View invoice details"
        actionLabel={canEdit('invoices') ? "Edit Invoice" : undefined}
        actionHref={canEdit('invoices') ? `/invoices/${invoice.id}/edit` : undefined}
        actionIcon={canEdit('invoices') ? <Edit className="mr-2 h-4 w-4" /> : undefined}
      />

      {/* Document Timeline */}
      <DocumentTimeline
        quotation={quotation ? {
          id: quotation.id,
          quotationNumber: quotation.quotationNumber,
          date: quotation.date,
          status: quotation.status,
        } : undefined}
        purchaseOrder={purchaseOrder ? {
          id: purchaseOrder.id,
          orderNumber: purchaseOrder.orderNumber,
          date: purchaseOrder.date,
          status: purchaseOrder.status,
        } : undefined}
        invoice={{
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          date: invoice.date,
          status: invoice.status,
        }}
        receipts={receipts.map(r => ({
          id: r.id,
          receiptNumber: r.receiptNumber,
          date: r.date,
          amount: r.amount,
        }))}
        onQuickConvert={(type, fromId) => {
          if (type === 'receipt') {
            router.push(`/receipts/new?invoiceId=${fromId || invoice.id}`)
          } else if (type === 'invoice') {
            if (purchaseOrder) {
              router.push(`/invoices/new?fromPO=${purchaseOrder.id}`)
            }
          }
        }}
        currentDocumentType="invoice"
      />

      {/* TAX INVOICE Display - PDF Format */}
      <Card className="border-2 border-blue-200/60 shadow-card">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8 pb-6 border-b-2 border-blue-300 dark:border-blue-700">
            <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">TAX INVOICE</h1>
          </div>

          {/* From Supplier / To Customer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="border-2 border-blue-200 dark:border-blue-800 p-4 rounded-lg bg-white dark:bg-blue-900/30">
              <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-3 pb-2 border-b border-blue-200 dark:border-blue-800">From Supplier</h3>
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
                <p><strong>{invoice.customer?.name || "N/A"}</strong></p>
                {invoice.customer?.email && <p>E-Mail: {invoice.customer.email}</p>}
                {invoice.customer?.phone && <p>Tel: {invoice.customer.phone}</p>}
                {invoice.customer?.address && <p>Address: {invoice.customer.address}</p>}
              </div>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="font-semibold text-blue-900 dark:text-blue-100">Tax Invoice Date:</span>
              <span className="text-gray-700 dark:text-gray-300">{formatDateForInvoice(invoice.date)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="font-semibold text-blue-900 dark:text-blue-100">Invoice No.:</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">{invoice.invoiceNumber}</span>
            </div>
            {invoice.projectName && (
              <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
                <span className="font-semibold text-blue-900 dark:text-blue-100">Project Name:</span>
                <span className="text-gray-700 dark:text-gray-300">{invoice.projectName}</span>
              </div>
            )}
            {invoice.lpoNumber && (
              <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
                <span className="font-semibold text-blue-900 dark:text-blue-100">LPO No.:</span>
                <span className="text-gray-700 dark:text-gray-300">{invoice.lpoNumber}</span>
              </div>
            )}
            {invoice.quotationId && quotation && (
              <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800 col-span-2">
                <span className="font-semibold text-blue-900 dark:text-blue-100">Linked Quotation:</span>
                <Button
                  variant="link"
                  onClick={() => router.push(`/quotations/${invoice.quotationId}`)}
                  className="text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 font-semibold"
                >
                  View Quotation #{quotation.quotationNumber}
                </Button>
              </div>
            )}
            {invoice.purchaseOrderId && purchaseOrder && (
              <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800 col-span-2">
                <span className="font-semibold text-blue-900 dark:text-blue-100">Linked Purchase Order:</span>
                <Button
                  variant="link"
                  onClick={() => router.push(`/purchase-orders/${invoice.purchaseOrderId}`)}
                  className="text-gold dark:text-yellow-400 hover:text-gold-dark dark:hover:text-yellow-300 font-semibold"
                >
                  View PO #{purchaseOrder.orderNumber}
                </Button>
              </div>
            )}
          </div>

          {/* Scope of Work */}
          {invoice.scopeOfWork && (
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
              <p><strong className="text-blue-900 dark:text-blue-100">Scope of Work:</strong> <span className="text-gray-700 dark:text-gray-300">{invoice.scopeOfWork}</span></p>
            </div>
          )}

          {/* Invoice Details Table */}
          <div className="overflow-x-auto mb-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-800 to-blue-900 dark:from-blue-700 dark:to-blue-800 text-white">
                  <TableHead className="font-bold">Good & Services Supplied</TableHead>
                  {(invoice.billingType === 'hours' || invoice.billingType === 'days') && (
                    <>
                      <TableHead className="font-bold">Vehicle#</TableHead>
                      <TableHead className="font-bold">{invoice.billingType === 'hours' ? 'Total hour' : 'Total Days'}</TableHead>
                    </>
                  )}
                  <TableHead className="font-bold">Unit Price</TableHead>
                  <TableHead className="font-bold">Gross Amount AED</TableHead>
                  <TableHead className="font-bold">Vat ({invoice.taxRate}%)</TableHead>
                  <TableHead className="font-bold">Net Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item, index) => {
                  const { grossAmount, vatAmount, netAmount } = calculateItemAmounts(item)
                  return (
                    <TableRow key={index} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800">
                      <TableCell className="font-medium text-gray-700 dark:text-gray-300">{item.description}</TableCell>
                      {(invoice.billingType === 'hours' || invoice.billingType === 'days') && (
                        <>
                          <TableCell className="text-gray-600 dark:text-gray-200">{item.vehicleNumber || '-'}</TableCell>
                          <TableCell className="text-gray-600 dark:text-gray-200">
                            {invoice.billingType === 'hours' ? (item.hours || 0) : (item.days || 0)}
                          </TableCell>
                        </>
                      )}
                      <TableCell className="text-gray-600 dark:text-gray-200">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-200 font-semibold">{formatCurrency(grossAmount)}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-200">{formatCurrency(vatAmount)}</TableCell>
                      <TableCell className="text-gray-700 dark:text-gray-200 font-bold">{formatCurrency(netAmount)}</TableCell>
                    </TableRow>
                  )
                })}
                <TableRow className="bg-blue-50 dark:bg-blue-900/50 font-bold border-t-2 border-blue-300 dark:border-blue-700">
                  <TableCell colSpan={invoice.billingType === 'hours' || invoice.billingType === 'days' ? 3 : 1}>
                    Net Payment Due for this Invoice
                  </TableCell>
                  <TableCell>
                    {invoice.items.reduce((sum, item) => {
                      if (invoice.billingType === 'hours') return sum + (item.hours || 0)
                      if (invoice.billingType === 'days') return sum + (item.days || 0)
                      return sum + (item.quantity || 0)
                    }, 0)}
                  </TableCell>
                  <TableCell>{formatCurrency(invoice.items[0]?.unitPrice || 0)}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(invoice.subtotal)}</TableCell>
                  <TableCell className="font-bold">{formatCurrency(invoice.taxAmount)}</TableCell>
                  <TableCell className="font-bold text-gold text-lg">{formatCurrency(invoice.total)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Amount in Words */}
          <div className="p-4 bg-gold/10 dark:bg-gold/20 rounded-lg border-2 border-gold/30 dark:border-gold/40 mb-6">
            <p className="font-semibold text-blue-900 dark:text-blue-100">
              <strong>Amount in Words:</strong> <span className="text-gray-700 dark:text-gray-300">{amountWords}</span>
            </p>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="border-2 border-blue-200 dark:border-blue-800 p-6 rounded-lg min-h-[120px] bg-white dark:bg-blue-900/30">
              <p className="font-bold text-blue-900 dark:text-blue-100 mb-4">For {COMPANY_INFO.name}</p>
              <div className="mt-8 pt-4 border-t border-blue-200 dark:border-blue-800">
                <p className="text-sm text-gray-600 dark:text-gray-300">Sign & Stamp</p>
              </div>
            </div>
            <div className="border-2 border-gold/60 dark:border-gold/40 p-6 rounded-lg min-h-[120px] bg-white dark:bg-blue-900/30">
              <p className="font-bold text-blue-900 dark:text-blue-100 mb-4">{invoice.customer?.name || "Customer"}</p>
              <div className="mt-8 pt-4 border-t border-gold/60 dark:border-gold/40">
                <p className="text-sm text-gray-600 dark:text-gray-300">Sign & Stamp</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Receipts Section */}
      {receipts.length > 0 && (
        <Card className="border-2 border-blue-200/60">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">Payment Receipts</h3>
            <div className="space-y-3">
              {receipts.map((receipt) => (
                <div
                  key={receipt.id}
                  className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/50 rounded-lg border-2 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <ReceiptIcon className="h-5 w-5 text-gold dark:text-yellow-400" />
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100">{receipt.receiptNumber}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{formatDate(receipt.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gold dark:text-yellow-400">{formatCurrency(receipt.amount)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/receipts/${receipt.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Terms & Notes Section */}
      {(invoice.terms || invoice.notes) && (
        <div className="grid gap-6 md:grid-cols-2">
          {invoice.terms && (
            <Card className="border-2 border-blue-200/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
                  <CardTitle className="text-xl font-bold text-blue-900">Terms & Conditions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{invoice.terms}</p>
              </CardContent>
            </Card>
          )}
          {invoice.notes && (
            <Card className="border-2 border-gold/60">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-gold to-gold-dark rounded-full"></div>
                  <CardTitle className="text-xl font-bold text-blue-900">Notes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Payment Summary */}
      <Card className="border-2 border-gold/60 bg-gradient-to-br from-gold/10 to-yellow-50">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-blue-900 mb-4">Payment Summary</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg border-2 border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Invoice Total</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(invoice.total)}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border-2 border-gold">
              <p className="text-sm text-gray-600 mb-1">Paid Amount</p>
              <p className="text-2xl font-bold text-gold">{formatCurrency(invoice.paidAmount || 0)}</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg border-2 border-red-200">
              <p className="text-sm text-gray-600 mb-1">Remaining</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(invoice.total - (invoice.paidAmount || 0))}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 justify-end flex-wrap">
        {(invoice.paidAmount || 0) < invoice.total && (
          <Button
            variant="gold"
            onClick={() => router.push(`/receipts/new?invoiceId=${invoice.id}`)}
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-6 py-3"
          >
            <Plus className="mr-2 h-5 w-5" />
            Record Payment
          </Button>
        )}
        <ExportButton
          data={getExportData()}
          filename={`Invoice-${invoice.invoiceNumber}`}
          variant="gold"
        />
        {canEdit('invoices') && (
          <Button
            variant="gold"
            onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-6 py-3"
          >
            <Edit className="mr-2 h-5 w-5" />
            Edit Invoice
          </Button>
        )}
      </div>
    </div>
  )
}
