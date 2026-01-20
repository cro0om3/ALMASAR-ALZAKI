"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Receipt, ShoppingCart, Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { quotationService, invoiceService, purchaseOrderService } from "@/lib/data"

interface RecentDocument {
  id: string
  type: 'quotation' | 'invoice' | 'purchase_order'
  number: string
  customer?: string
  amount: number
  status: string
  date: string
  link: string
}

export function RecentDocuments({ limit = 5 }: { limit?: number }) {
  const [documents, setDocuments] = useState<RecentDocument[]>([])

  useEffect(() => {
    const loadDocuments = () => {
      const docs: RecentDocument[] = []

      // Get recent quotations
      quotationService.getAll()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
        .forEach(q => {
          docs.push({
            id: q.id,
            type: 'quotation',
            number: q.quotationNumber,
            amount: q.total,
            status: q.status,
            date: q.date,
            link: `/quotations/${q.id}`,
          })
        })

      // Get recent invoices
      invoiceService.getAll()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
        .forEach(inv => {
          docs.push({
            id: inv.id,
            type: 'invoice',
            number: inv.invoiceNumber,
            amount: inv.total,
            status: inv.status,
            date: inv.date,
            link: `/invoices/${inv.id}`,
          })
        })

      // Get recent purchase orders
      purchaseOrderService.getAll()
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, limit)
        .forEach(po => {
          docs.push({
            id: po.id,
            type: 'purchase_order',
            number: po.orderNumber,
            amount: po.total,
            status: po.status,
            date: po.date,
            link: `/purchase-orders/${po.id}`,
          })
        })

      // Sort by date and take most recent
      docs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setDocuments(docs.slice(0, limit))
    }

    loadDocuments()
  }, [limit])

  const getIcon = (type: RecentDocument['type']) => {
    switch (type) {
      case 'quotation':
        return <FileText className="h-4 w-4" />
      case 'invoice':
        return <Receipt className="h-4 w-4" />
      case 'purchase_order':
        return <ShoppingCart className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'success' | 'default' | 'destructive' | 'warning'> = {
      'paid': 'success',
      'accepted': 'success',
      'sent': 'default',
      'overdue': 'destructive',
      'rejected': 'destructive',
      'expired': 'warning',
      'draft': 'default',
    }
    return statusMap[status] || 'default'
  }

  if (documents.length === 0) {
    return (
      <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
            <Clock className="h-5 w-5 text-gold dark:text-yellow-400" />
            Recent Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No recent documents
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-blue-200/60 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
          <Clock className="h-5 w-5 text-gold dark:text-yellow-400" />
          Recent Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href={doc.link}
              className="block p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getIcon(doc.type)}
                  <span className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                    {doc.number}
                  </span>
                  <Badge variant={getStatusBadge(doc.status)} className="text-xs">
                    {doc.status}
                  </Badge>
                </div>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
                  {formatCurrency(doc.amount)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>{formatDate(doc.date)}</span>
                <ArrowRight className="h-3 w-3" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
