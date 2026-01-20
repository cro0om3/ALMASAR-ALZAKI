"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, ShoppingCart, Receipt, CheckCircle2, Circle, ArrowRight, Link2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

interface TimelineItem {
  id: string
  type: 'quotation' | 'purchase_order' | 'invoice' | 'receipt'
  title: string
  number: string
  date: string
  status: string
  link: string
  completed: boolean
  state: 'completed' | 'current' | 'disabled' | 'pending'
}

interface DocumentTimelineProps {
  quotation?: {
    id: string
    quotationNumber: string
    date: string
    status: string
  } | null
  purchaseOrder?: {
    id: string
    orderNumber: string
    date: string
    status: string
  } | null
  invoice?: {
    id: string
    invoiceNumber: string
    date: string
    status: string
  } | null
  receipts?: Array<{
    id: string
    receiptNumber: string
    date: string
    amount: number
  }>
  onQuickConvert?: (type: 'po' | 'invoice' | 'receipt', id?: string) => void
  currentDocumentType?: 'quotation' | 'purchase_order' | 'invoice' | 'receipt'
}

export function DocumentTimeline({
  quotation,
  purchaseOrder,
  invoice,
  receipts = [],
  onQuickConvert,
  currentDocumentType,
}: DocumentTimelineProps) {
  // Define all possible steps in order
  const allSteps = [
    { type: 'quotation' as const, title: 'Quotation', data: quotation },
    { type: 'purchase_order' as const, title: 'Purchase Order', data: purchaseOrder },
    { type: 'invoice' as const, title: 'Invoice', data: invoice },
    { type: 'receipt' as const, title: 'Receipt', data: receipts[0] || null }, // First receipt only for display
  ]

  // Determine step order for current document type
  const stepOrder: Record<string, number> = {
    'quotation': 0,
    'purchase_order': 1,
    'invoice': 2,
    'receipt': 3,
  }

  const currentStepIndex = currentDocumentType ? stepOrder[currentDocumentType] : -1

  const items: TimelineItem[] = allSteps.map((step, index) => {
    const isCurrent = currentDocumentType === step.type
    const isBeforeCurrent = currentStepIndex >= 0 && index < currentStepIndex
    const isAfterCurrent = currentStepIndex >= 0 && index > currentStepIndex
    const exists = step.data !== null && step.data !== undefined

    // Determine state
    let state: 'completed' | 'current' | 'disabled' | 'pending'
    if (isCurrent) {
      state = 'current'
    } else if (isBeforeCurrent && exists) {
      state = 'completed'
    } else if (isAfterCurrent || !exists) {
      state = 'disabled'
    } else {
      state = 'pending'
    }

    // Build item based on step type
    if (step.type === 'quotation' && step.data) {
      const q = step.data as NonNullable<typeof quotation>
      if (!q || !q.id) {
        return {
          id: `placeholder-${step.type}`,
          type: step.type,
          title: step.title,
          number: 'N/A',
          date: '',
          status: 'pending',
          link: '#',
          completed: false,
          state: 'disabled' as const,
        }
      }
      return {
        id: q.id,
        type: 'quotation' as const,
        title: 'Quotation',
        number: q.quotationNumber,
        date: q.date,
        status: q.status,
        link: `/quotations/${q.id}`,
        completed: state === 'completed' || (q.status === 'accepted' || q.status === 'sent'),
        state,
      }
    } else if (step.type === 'purchase_order' && step.data) {
      const po = step.data as NonNullable<typeof purchaseOrder>
      if (!po || !po.id) {
        return {
          id: `placeholder-${step.type}`,
          type: step.type,
          title: step.title,
          number: 'N/A',
          date: '',
          status: 'pending',
          link: '#',
          completed: false,
          state: 'disabled' as const,
        }
      }
      return {
        id: po.id,
        type: 'purchase_order' as const,
        title: 'Purchase Order',
        number: po.orderNumber,
        date: po.date,
        status: po.status,
        link: `/purchase-orders/${po.id}`,
        completed: state === 'completed' || ['approved', 'completed', 'received'].includes(po.status),
        state,
      }
    } else if (step.type === 'invoice' && step.data) {
      const inv = step.data as NonNullable<typeof invoice>
      if (!inv || !inv.id) {
        return {
          id: `placeholder-${step.type}`,
          type: step.type,
          title: step.title,
          number: 'N/A',
          date: '',
          status: 'pending',
          link: '#',
          completed: false,
          state: 'disabled' as const,
        }
      }
      return {
        id: inv.id,
        type: 'invoice' as const,
        title: 'Invoice',
        number: inv.invoiceNumber,
        date: inv.date,
        status: inv.status,
        link: `/invoices/${inv.id}`,
        completed: state === 'completed' || inv.status === 'paid',
        state,
      }
    } else if (step.type === 'receipt' && step.data) {
      const rec = step.data as NonNullable<typeof receipts[0]>
      if (!rec || !rec.id) {
        return {
          id: `placeholder-${step.type}`,
          type: step.type,
          title: step.title,
          number: 'N/A',
          date: '',
          status: 'pending',
          link: '#',
          completed: false,
          state: 'disabled' as const,
        }
      }
      return {
        id: rec.id,
        type: 'receipt' as const,
        title: 'Receipt',
        number: rec.receiptNumber,
        date: rec.date,
        status: 'paid',
        link: `/receipts/${rec.id}`,
        completed: true,
        state,
      }
    } else {
      // Disabled/placeholder step
      return {
        id: `placeholder-${step.type}`,
        type: step.type,
        title: step.title,
        number: 'N/A',
        date: '',
        status: 'pending',
        link: '#',
        completed: false,
        state: 'disabled' as const,
      }
    }
  }).filter(item => {
    // Always show all steps if currentDocumentType is set, otherwise only show existing ones
    if (currentDocumentType) {
      return true
    }
    return item.state !== 'disabled' || item.id.startsWith('placeholder')
  })

  const getIcon = (type: TimelineItem['type'], state: TimelineItem['state']) => {
    let iconClass = ""
    if (state === 'completed') {
      iconClass = "text-green-600 dark:text-green-400"
    } else if (state === 'current') {
      iconClass = "text-blue-600 dark:text-blue-400"
    } else if (state === 'disabled') {
      iconClass = "text-gray-300 dark:text-gray-600"
    } else {
      iconClass = "text-gray-400 dark:text-gray-300"
    }
    switch (type) {
      case 'quotation':
        return <FileText className={`h-5 w-5 ${iconClass}`} />
      case 'purchase_order':
        return <ShoppingCart className={`h-5 w-5 ${iconClass}`} />
      case 'invoice':
        return <Receipt className={`h-5 w-5 ${iconClass}`} />
      case 'receipt':
        return <CheckCircle2 className={`h-5 w-5 ${iconClass}`} />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { variant: "default" | "success" | "destructive" | "warning" | "secondary", label: string }> = {
      'draft': { variant: 'secondary', label: 'Draft' },
      'sent': { variant: 'default', label: 'Sent' },
      'accepted': { variant: 'success', label: 'Accepted' },
      'rejected': { variant: 'destructive', label: 'Rejected' },
      'pending': { variant: 'warning', label: 'Pending' },
      'approved': { variant: 'success', label: 'Approved' },
      'completed': { variant: 'success', label: 'Completed' },
      'received': { variant: 'success', label: 'Received' },
      'paid': { variant: 'success', label: 'Paid' },
      'overdue': { variant: 'destructive', label: 'Overdue' },
    }
    const statusInfo = statusMap[status] || { variant: 'secondary' as const, label: status }
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
  }

  // Determine next step
  const getNextStep = () => {
    if (!quotation && !purchaseOrder && !invoice) return null
    if (quotation && quotation.status === 'accepted' && !purchaseOrder) {
      return { type: 'po' as const, label: 'Create Purchase Order', from: quotation.id }
    }
    if (purchaseOrder && !invoice) {
      return { type: 'invoice' as const, label: 'Create Invoice', from: purchaseOrder.id }
    }
    if (invoice && invoice.status !== 'paid' && receipts.length === 0) {
      return { type: 'receipt' as const, label: 'Record Payment', from: invoice.id }
    }
    return null
  }

  const nextStep = getNextStep()

  return (
    <Card className="border-2 border-blue-200/60 shadow-card">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
          <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100">Document Timeline</h3>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-300">
            <p>No related documents found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item, index) => {
              const isCurrent = item.state === 'current'
              const isCompleted = item.state === 'completed'
              const isDisabled = item.state === 'disabled'
              
              return (
                <div key={item.id} className="relative">
                  {index < items.length - 1 && (
                    <div className={`absolute left-[11px] top-8 bottom-[-24px] w-0.5 ${
                      isDisabled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-200 dark:bg-blue-700'
                    }`}></div>
                  )}
                  <div className={`flex items-start gap-4 p-3 rounded-lg transition-colors ${
                    isCurrent ? 'bg-blue-50 dark:bg-blue-900/50 border-2 border-blue-300 dark:border-blue-600' : ''
                  }`}>
                    <div className={`relative z-10 flex items-center justify-center w-6 h-6 rounded-full ${
                      isCompleted ? 'bg-green-100 dark:bg-green-900/50 border-2 border-green-600 dark:border-green-400' :
                      isCurrent ? 'bg-blue-100 dark:bg-blue-800 border-2 border-blue-600 dark:border-blue-400' :
                      isDisabled ? 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600' :
                      'bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : isCurrent ? (
                        <Circle className="h-4 w-4 text-blue-600 dark:text-blue-400 fill-blue-600 dark:fill-blue-400" />
                      ) : (
                        <Circle className={`h-4 w-4 ${isDisabled ? 'text-gray-300 dark:text-gray-500' : 'text-gray-400 dark:text-gray-300'}`} />
                      )}
                    </div>
                    <div className={`flex-1 pb-6 ${isDisabled ? 'opacity-50' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getIcon(item.type, item.state)}
                          {isDisabled ? (
                            <span className="font-semibold text-gray-400 dark:text-gray-300">
                              {item.title} {item.number !== 'N/A' ? item.number : '(Not Created)'}
                            </span>
                          ) : (
                            <Link href={item.link} className={`font-semibold hover:underline ${
                              isCurrent ? 'text-blue-900 dark:text-blue-100 hover:text-blue-700 dark:hover:text-blue-300' : 'text-blue-900 dark:text-blue-100 hover:text-blue-700 dark:hover:text-blue-300'
                            }`}>
                              {item.title} {item.number}
                            </Link>
                          )}
                        </div>
                        {!isDisabled && getStatusBadge(item.status)}
                      </div>
                      {!isDisabled && item.date && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 ml-7">Date: {formatDate(item.date)}</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {nextStep && onQuickConvert && (
          <div className="mt-6 pt-6 border-t border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <span className="font-semibold text-blue-900 dark:text-blue-100">Next Step</span>
            </div>
            <Button
              onClick={() => onQuickConvert(nextStep.type, nextStep.from)}
              className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 shadow-blue hover:shadow-xl font-bold border-2 border-blue-300/50"
            >
              <Link2 className="mr-2 h-4 w-4" />
              {nextStep.label}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
