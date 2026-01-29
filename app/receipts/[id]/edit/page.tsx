"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { PageHeader } from "@/components/shared/PageHeader"

const receiptSchema = z.object({
  date: z.string().optional(),
  paymentDate: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0").optional(),
  paymentMethod: z.enum(["cash", "bank_transfer", "cheque", "credit_card", "other"]).optional(),
  referenceNumber: z.string().optional(),
  bankName: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["draft", "issued", "cancelled"]).optional(),
})

type ReceiptFormData = z.infer<typeof receiptSchema>

export default function EditReceiptPage() {
  const params = useParams()
  const router = useRouter()
  const [receipt, setReceipt] = useState<any>(null)
  const [invoice, setInvoice] = useState<any>(null)
  const [remainingAmount, setRemainingAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
  })

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
        const [invRes, receiptsRes] = await Promise.all([
          fetch(`/api/invoices/${rcp.invoiceId}`),
          fetch('/api/receipts'),
        ])
        if (cancelled) return
        const inv = invRes.ok ? await invRes.json() : null
        const allReceipts = receiptsRes.ok ? await receiptsRes.json() : []
        setReceipt(rcp)
        setInvoice(inv)
        const dateStr = (d: string) => (d && d.includes('T') ? d.split('T')[0] : d)
        setValue("date", dateStr(rcp.date))
        setValue("paymentDate", dateStr(rcp.paymentDate))
        setValue("amount", rcp.amount)
        setValue("paymentMethod", rcp.paymentMethod)
        setValue("referenceNumber", rcp.referenceNumber || "")
        setValue("bankName", rcp.bankName || "")
        setValue("notes", rcp.notes || "")
        setValue("status", rcp.status)
        if (inv) {
          const otherReceipts = (allReceipts || []).filter((r: any) => r.invoiceId === rcp.invoiceId && r.id !== id && r.status !== 'cancelled')
          const totalPaid = otherReceipts.reduce((sum: number, r: any) => sum + r.amount, 0)
          setRemainingAmount(inv.total - totalPaid)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [params.id, setValue])

  const watchedAmount = watch("amount")

  const onSubmit = async (data: ReceiptFormData) => {
    if (!receipt) return
    setSaving(true)
    try {
      const res = await fetch(`/api/receipts/${receipt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: data.date,
          paymentDate: data.paymentDate,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          referenceNumber: data.referenceNumber || undefined,
          bankName: data.bankName || undefined,
          notes: data.notes || undefined,
          status: data.status,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update receipt')
      }
      router.push(`/receipts/${receipt.id}`)
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Failed to update receipt')
    } finally {
      setSaving(false)
    }
  }

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

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Edit Receipt ${receipt.receiptNumber}`}
        description="Update receipt details"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded"></span>
            Receipt Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-blue-900 font-medium">Receipt Number</Label>
              <Input value={receipt.receiptNumber} disabled className="h-12 bg-gray-100" />
            </div>

            {invoice && (
              <div className="space-y-2">
              <Label className="text-blue-900 font-medium">Invoice Details</Label>
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-400 dark:border-blue-800">
                <p className="font-semibold text-blue-900">Total: {formatCurrency(invoice.total)}</p>
                <p className="text-sm text-gray-600">Paid: {formatCurrency(invoice.paidAmount || 0)}</p>
                <p className="text-sm font-semibold text-gold">Remaining: {formatCurrency(remainingAmount)}</p>
              </div>
            </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="date" className="text-blue-900 font-medium">Receipt Date</Label>
              <Input type="date" {...register("date")} className="h-12" />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentDate" className="text-blue-900 font-medium">Payment Date</Label>
              <Input type="date" {...register("paymentDate")} className="h-12" />
              {errors.paymentDate && (
                <p className="text-sm text-red-600">{errors.paymentDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-blue-900 font-medium">Amount</Label>
              <div className="relative">
                <Input
                  type="number"
                  step="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  className="h-12 border-2 border-gold focus:border-gold-dark focus:ring-2 focus:ring-gold font-semibold text-blue-900"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">AED</span>
              </div>
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod" className="text-blue-900 font-medium">Payment Method</Label>
              <Select
                value={watch("paymentMethod")}
                onValueChange={(value) => setValue("paymentMethod", value as any)}
              >
                <SelectTrigger className="h-12 border-2 border-blue-400 dark:border-blue-800/60">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="credit_card">Credit Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-blue-900 font-medium">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value) => setValue("status", value as any)}
              >
                <SelectTrigger className="h-12 border-2 border-blue-400 dark:border-blue-800/60">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="issued">Issued</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {watch("paymentMethod") === "cheque" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="referenceNumber" className="text-blue-900 font-medium">Cheque Number</Label>
                  <Input {...register("referenceNumber")} className="h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName" className="text-blue-900 font-medium">Bank Name</Label>
                  <Input {...register("bankName")} className="h-12" />
                </div>
              </>
            )}

            {watch("paymentMethod") === "bank_transfer" && (
              <div className="space-y-2">
                <Label htmlFor="referenceNumber" className="text-blue-900 font-medium">Transaction Reference</Label>
                <Input {...register("referenceNumber")} className="h-12" />
              </div>
            )}

            {watch("paymentMethod") === "credit_card" && (
              <div className="space-y-2">
                <Label htmlFor="referenceNumber" className="text-blue-900 font-medium">Transaction ID</Label>
                <Input {...register("referenceNumber")} className="h-12" />
              </div>
            )}

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes" className="text-blue-900 font-medium">Notes</Label>
              <Textarea {...register("notes")} rows={4} className="border-2 border-blue-400 dark:border-blue-800/60" />
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-500 font-semibold px-6 py-3"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={saving}
            variant="gold"
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-8 py-3"
          >
            {saving ? "Saving..." : "Update Receipt"}
          </Button>
        </div>
      </form>
    </div>
  )
}
