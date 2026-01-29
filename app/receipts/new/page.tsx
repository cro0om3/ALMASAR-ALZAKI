"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { FileUpload } from "@/components/shared/FileUpload"
import { aiService } from "@/lib/services/ai-service"
import { useToast } from "@/lib/hooks/use-toast"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { Image, Upload, Sparkles } from "lucide-react"

const receiptSchema = z.object({
  invoiceId: z.string().optional(),
  date: z.string().optional(),
  paymentDate: z.string().optional(),
  amount: z.number().min(0.01, "Amount must be greater than 0").optional(),
  paymentMethod: z.enum(["cash", "bank_transfer", "cheque", "credit_card", "other"]).optional(),
  referenceNumber: z.string().optional(),
  bankName: z.string().optional(),
  notes: z.string().optional(),
  paymentImageUrl: z.string().optional(),
})

type ReceiptFormData = z.infer<typeof receiptSchema>

function ReceiptForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const invoiceId = searchParams.get("invoiceId")
  const [invoices, setInvoices] = useState<any[]>([])
  const [allReceipts, setAllReceipts] = useState<any[]>([])
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [remainingAmount, setRemainingAmount] = useState(0)
  const [paymentImage, setPaymentImage] = useState<string | null>(null)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      invoiceId: invoiceId || "",
      date: new Date().toISOString().split("T")[0],
      paymentDate: new Date().toISOString().split("T")[0],
      amount: 0,
      paymentMethod: "cash",
      referenceNumber: "",
      bankName: "",
      notes: "",
      paymentImageUrl: "",
    },
  })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        const [invRes, custRes, rcpRes] = await Promise.all([
          fetch('/api/invoices'),
          fetch('/api/customers'),
          fetch('/api/receipts'),
        ])
        if (cancelled) return
        const allInvoices = invRes.ok ? await invRes.json() : []
        const customers = custRes.ok ? await custRes.json() : []
        const receiptsList = rcpRes.ok ? await rcpRes.json() : []
        const customersById = (customers || []).reduce((acc: Record<string, any>, c: any) => { acc[c.id] = c; return acc }, {})
        const invoicesWithCustomers = (allInvoices || []).map((inv: any) => ({
          ...inv,
          customer: customersById[inv.customerId],
        }))
        setInvoices(invoicesWithCustomers)
        setAllReceipts(receiptsList || [])

        if (invoiceId) {
          const inv = (invoicesWithCustomers as any[]).find((i: any) => i.id === invoiceId)
          if (inv) {
            setSelectedInvoice(inv)
            setValue("invoiceId", invoiceId)
            const receipts = (receiptsList || []).filter((r: any) => r.invoiceId === invoiceId)
            const totalPaid = receipts
              .filter((r: any) => r.status !== 'cancelled')
              .reduce((sum: number, r: any) => sum + r.amount, 0)
            const remaining = inv.total - totalPaid
            setRemainingAmount(remaining)
            setValue("amount", remaining > 0 ? remaining : 0)
          }
        }
      } catch (_e) {
        if (!cancelled) setInvoices([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [invoiceId, setValue])

  const watchedInvoiceId = watch("invoiceId")
  const watchedAmount = watch("amount")

  useEffect(() => {
    if (watchedInvoiceId && invoices.length > 0) {
      const inv = invoices.find((i: any) => i.id === watchedInvoiceId)
      if (inv) {
        setSelectedInvoice(inv)
        const receipts = allReceipts.filter((r: any) => r.invoiceId === watchedInvoiceId)
        const totalPaid = receipts
          .filter((r: any) => r.status !== 'cancelled')
          .reduce((sum: number, r: any) => sum + r.amount, 0)
        const remaining = inv.total - totalPaid
        setRemainingAmount(remaining)
        const amt = watchedAmount ?? 0
        if (amt === 0 || amt > remaining) {
          setValue("amount", remaining > 0 ? remaining : 0)
        }
      }
    }
  }, [watchedInvoiceId, watchedAmount, setValue, invoices, allReceipts])

  const handleImageUpload = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(',')[1]
        setPaymentImage(base64)
        setValue("paymentImageUrl", `data:image/jpeg;base64,${base64}`)
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleAnalyzeImage = async () => {
    if (!paymentImage) {
      toast({
        title: "Error",
        description: "Please upload an image first",
        variant: "destructive",
      })
      return
    }

    if (!aiService.isEnabled()) {
      toast({
        title: "AI Not Enabled",
        description: "Please enable AI in Settings and add your OpenAI API key",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzingImage(true)
    try {
      const result = await aiService.analyzePaymentImage(paymentImage)
      
      if (result.error) {
        toast({
          title: "Analysis Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      // Fill form with extracted data
      if (result.amount) {
        setValue("amount", result.amount)
      }
      if (result.date) {
        setValue("paymentDate", result.date)
      }
      if (result.referenceNumber) {
        setValue("referenceNumber", result.referenceNumber)
      }
      if (result.bankName) {
        setValue("bankName", result.bankName)
      }
      if (result.paymentMethod) {
        setValue("paymentMethod", result.paymentMethod as any)
      }

      toast({
        title: "Success",
        description: "Payment information extracted from image successfully!",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzingImage(false)
    }
  }

  const onSubmit = async (data: ReceiptFormData) => {
    if (!selectedInvoice) return
    try {
      const receiptNumber = `RCP-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 9)}`
      const receiptData = {
        receiptNumber,
        invoiceId: data.invoiceId,
        customerId: selectedInvoice.customerId,
        date: data.date,
        paymentDate: data.paymentDate,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        referenceNumber: data.referenceNumber || undefined,
        bankName: data.bankName || undefined,
        notes: data.notes || undefined,
        paymentImageUrl: data.paymentImageUrl || undefined,
        status: "issued" as const,
      }
      const res = await fetch('/api/receipts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(receiptData),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to create receipt')
      }
      router.push("/receipts")
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Failed to create receipt')
    }
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-8 md:p-10 rounded-2xl shadow-luxury">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">New Receipt</h1>
          <p className="text-blue-100 text-lg font-medium">Record a payment receipt</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded"></span>
            Receipt Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="invoiceId" className="text-blue-900 font-medium">Invoice</Label>
              <Select
                value={watch("invoiceId")}
                onValueChange={(value) => setValue("invoiceId", value)}
              >
                <SelectTrigger className="h-12 border-2 border-blue-400 dark:border-blue-800/60">
                  <SelectValue placeholder="Select invoice" />
                </SelectTrigger>
                <SelectContent>
                  {invoices
                    .filter((inv: any) => {
                      const receipts = allReceipts.filter((r: any) => r.invoiceId === inv.id)
                      const totalPaid = receipts
                        .filter((r: any) => r.status !== 'cancelled')
                        .reduce((sum: number, r: any) => sum + r.amount, 0)
                      return totalPaid < inv.total && inv.status !== 'cancelled'
                    })
                    .map((invoice: any) => {
                      const receipts = allReceipts.filter((r: any) => r.invoiceId === invoice.id)
                      const totalPaid = receipts
                        .filter((r: any) => r.status !== 'cancelled')
                        .reduce((sum: number, r: any) => sum + r.amount, 0)
                      return (
                      <SelectItem key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber} - {invoice.customer?.name} - {formatCurrency(invoice.total)} (Paid: {formatCurrency(totalPaid)})
                      </SelectItem>
                    )})}
                </SelectContent>
              </Select>
              {errors.invoiceId && (
                <p className="text-sm text-red-600">{errors.invoiceId.message}</p>
              )}
            </div>

            {selectedInvoice && (
              <div className="space-y-2">
                <Label className="text-blue-900 font-medium">Invoice Details</Label>
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-400 dark:border-blue-800">
                  <p className="font-semibold text-blue-900">Total: {formatCurrency(selectedInvoice.total)}</p>
                  <p className="text-sm text-gray-600">Paid: {formatCurrency(selectedInvoice.paidAmount || 0)}</p>
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
                  max={remainingAmount}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">AED</span>
              </div>
              {errors.amount && (
                <p className="text-sm text-red-600">{errors.amount.message}</p>
              )}
              {(watchedAmount ?? 0) > remainingAmount && (
                <p className="text-sm text-red-600">Amount cannot exceed remaining balance: {formatCurrency(remainingAmount)}</p>
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
              {errors.paymentMethod && (
                <p className="text-sm text-red-600">{errors.paymentMethod.message}</p>
              )}
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

        {/* Payment Image Upload */}
        <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded"></span>
            Payment Proof Image
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-blue-900 font-medium">Upload Payment Image (Check, Receipt, etc.)</Label>
              <FileUpload
                accept="image/*"
                onFileSelect={(files) => {
                  if (files.length > 0) {
                    handleImageUpload(files[0])
                  }
                }}
                className="border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6"
              />
            </div>
            
            {paymentImage && (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img
                    src={`data:image/jpeg;base64,${paymentImage}`}
                    alt="Payment proof"
                    className="max-w-full h-auto max-h-64 rounded-lg border-2 border-blue-400 dark:border-blue-800/60"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAnalyzeImage}
                  disabled={isAnalyzingImage || !aiService.isEnabled()}
                  className="border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/50"
                >
                  {isAnalyzingImage ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Extract Data with AI
                    </>
                  )}
                </Button>
                {!aiService.isEnabled() && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enable AI in Settings to automatically extract payment information from the image
                  </p>
                )}
              </div>
            )}
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
            variant="gold"
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-8 py-3"
            disabled={(watchedAmount ?? 0) > remainingAmount || (watchedAmount ?? 0) <= 0}
          >
            Create Receipt
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function NewReceiptPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <ReceiptForm />
    </Suspense>
  )
}
