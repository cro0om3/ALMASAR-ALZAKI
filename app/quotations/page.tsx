"use client"

import { useState, useEffect } from "react"
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
import { Card } from "@/components/ui/card"
import { Plus, Search, Eye, Edit, Trash2, FileText } from "lucide-react"
import { quotationService, customerService } from "@/lib/data"
import { Quotation } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { PageHeader } from "@/components/shared/PageHeader"

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()

  useEffect(() => {
    const loadQuotations = () => {
      const allQuotations = quotationService.getAll()
      const quotationsWithCustomers = allQuotations.map(q => ({
        ...q,
        customer: customerService.getById(q.customerId),
      }))
      setQuotations(quotationsWithCustomers)
    }
    loadQuotations()
  }, [])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this quotation?")) {
      quotationService.delete(id)
      setQuotations(quotationService.getAll().map(q => ({
        ...q,
        customer: customerService.getById(q.customerId),
      })))
    }
  }

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

  const filteredQuotations = quotations.filter((q) => {
    const matchesSearch =
      q.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.customer?.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || q.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-8">
      <PageHeader
        title="Quotations"
        description="Manage your quotations"
        actionLabel={canEdit('quotations') ? "New Quotation" : undefined}
        actionHref={canEdit('quotations') ? "/quotations/new" : undefined}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search quotations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 text-base"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-12 rounded-lg border-2 border-blue-200/60 bg-white px-4 py-2 text-sm font-semibold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      <Card className="border-2 border-blue-200/60 shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b-2 border-blue-200">
              <TableHead className="font-bold text-blue-900">Quote Number</TableHead>
              <TableHead className="font-bold text-blue-900">Customer</TableHead>
              <TableHead className="font-bold text-blue-900">Date</TableHead>
              <TableHead className="font-bold text-blue-900">Total</TableHead>
              <TableHead className="font-bold text-blue-900">Status</TableHead>
              <TableHead className="text-right font-bold text-blue-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredQuotations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="h-12 w-12 text-gray-300" />
                    <p className="text-gray-500 font-medium text-lg">No quotations found</p>
                    <p className="text-gray-400 text-sm">Create your first quotation to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredQuotations.map((quotation) => (
                <TableRow key={quotation.id}>
                  <TableCell className="font-medium">
                    {quotation.quotationNumber}
                  </TableCell>
                  <TableCell>
                    {quotation.customer?.name || "Unknown Customer"}
                  </TableCell>
                  <TableCell>{formatDate(quotation.date)}</TableCell>
                  <TableCell>{formatCurrency(quotation.total)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(quotation.status)}>
                      {quotation.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/quotations/${quotation.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit('quotations') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/quotations/${quotation.id}/edit`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete('quotations') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(quotation.id)}
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
