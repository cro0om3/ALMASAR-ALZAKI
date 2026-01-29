"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Trash2, Save, X, Loader2, ShoppingCart } from "lucide-react"
import { Quotation, QuotationItem, QuotationStatus } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"
import { usePermissions } from "@/lib/hooks/use-permissions"
import { useToast } from "@/lib/hooks/use-toast"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { Modal } from "@/components/shared/Modal"

const quotationSchema = z.object({
  customerId: z.string().optional(),
  date: z.string().optional(),
  validUntil: z.string().optional(),
  billingType: z.enum(["hours", "days", "quantity"]).optional(),
  items: z.array(
    z.object({
      description: z.string().optional(),
      quantity: z.number().min(0.01, "Quantity must be greater than 0").optional(),
      unitPrice: z.number().min(0, "Unit price must be 0 or greater").optional(),
      tax: z.number().min(0).max(100).optional(),
      hours: z.number().min(0).optional(),
      days: z.number().min(0).optional(),
    })
  ).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
})

type QuotationFormData = z.infer<typeof quotationSchema>

export default function EditQuotationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { canEdit } = usePermissions()
  const [quotation, setQuotation] = useState<Quotation | null>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showCreatePOModal, setShowCreatePOModal] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<QuotationFormData>({
    resolver: zodResolver(quotationSchema),
    defaultValues: {
      items: [],
      taxRate: 5,
      status: "draft",
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  })

  useEffect(() => {
    const id = params.id as string
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch(`/api/quotations/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/customers').then((r) => (r.ok ? r.json() : [])),
    ])
      .then(([q, allCustomers]) => {
        if (cancelled) return
        if (!q) return
        setQuotation(q)
        setCustomers(allCustomers || [])
        const dateStr = typeof q.date === 'string' ? q.date : q.date?.toISOString?.()
        const validStr = typeof q.validUntil === 'string' ? q.validUntil : q.validUntil?.toISOString?.()
        reset({
          customerId: q.customerId,
          date: dateStr?.split('T')[0] ?? '',
          validUntil: validStr?.split('T')[0] ?? '',
          billingType: (q.billingType || 'quantity') as "hours" | "days" | "quantity",
          items: (q.items || []).map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            tax: item.tax ?? 0,
            hours: item.hours,
            days: item.days,
          })),
          taxRate: q.taxRate,
          status: q.status as QuotationStatus,
          terms: q.terms || "",
          notes: q.notes || "",
        })
      })
      .catch((error) => {
        if (!cancelled) {
          console.error("Error loading quotation:", error)
          toast({
            title: "Error",
            description: "Failed to load quotation. Please try again.",
            variant: "destructive",
          })
        }
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [params.id, reset, toast])

  const watchedItems = watch("items")
  const watchedTaxRate = watch("taxRate")
  const watchedBillingType = watch("billingType")

  // Compute subtotal, VAT, total from form values so they update immediately when unit price / quantity change
  const { subtotal, taxAmount, total } = (() => {
    const billingType = watchedBillingType || 'quantity'
    let sub = 0
    ;(watchedItems || []).forEach((item) => {
      const unitPrice = Number(item?.unitPrice) || 0
      const qty = Number(item?.quantity) || 0
      const hours = Number(item?.hours) || 0
      const days = Number(item?.days) || 0
      let itemTotal = 0
      if (billingType === 'hours') itemTotal = hours * unitPrice
      else if (billingType === 'days') itemTotal = days * unitPrice
      else itemTotal = qty * unitPrice
      sub += itemTotal
    })
    const taxRate = Number(watchedTaxRate) || 0
    const tax = (sub * taxRate) / 100
    return { subtotal: sub, taxAmount: tax, total: sub + tax }
  })()

  const addItem = () => {
    append({ description: "", quantity: 1, unitPrice: 0, tax: 0 })
  }

  const calculateItemTotal = (item: any, index: number) => {
    const billingType = watchedBillingType || 'quantity'
    let itemTotal = 0
    
    if (billingType === 'hours' && item.hours) {
      itemTotal = item.hours * item.unitPrice
    } else if (billingType === 'days' && item.days) {
      itemTotal = item.days * item.unitPrice
    } else if (billingType === 'quantity' && item.quantity) {
      itemTotal = item.quantity * item.unitPrice
    }
    
    const itemTax = (itemTotal * (Number(watchedTaxRate) || 0)) / 100
    
    return itemTotal + itemTax
  }

  const onSubmit = async (data: QuotationFormData) => {
    if (!canEdit('quotations')) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to edit quotations.",
        variant: "destructive",
      })
      return
    }

    if (!quotation) {
      toast({
        title: "Error",
        description: "Quotation not found.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    try {
      const billingType = data.billingType || 'quantity'
      
      const items: QuotationItem[] = (data.items || []).map((item, index) => {
        const unitPrice = item.unitPrice ?? 0
        let itemTotal = 0
        let quantity = 0
        if (billingType === 'hours' && item.hours) {
          itemTotal = item.hours * unitPrice
          quantity = item.hours
        } else if (billingType === 'days' && item.days) {
          itemTotal = item.days * unitPrice
          quantity = item.days
        } else if (billingType === 'quantity' && item.quantity) {
          itemTotal = item.quantity * unitPrice
          quantity = item.quantity
        }
        const taxRate = data.taxRate ?? 5
        const itemTax = (itemTotal * taxRate) / 100
        const existingItem = quotation.items?.[index]
        return {
          id: existingItem?.id || `item-${Date.now()}-${index}`,
          description: item.description ?? '',
          quantity: quantity,
          unitPrice: unitPrice,
          tax: taxRate,
          total: itemTotal + itemTax,
          hours: item.hours,
          days: item.days,
          billingType: billingType,
        }
      })

      const res = await fetch(`/api/quotations/${quotation.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: data.customerId,
          date: data.date,
          validUntil: data.validUntil,
          billingType: billingType,
          items: items.map((it) => ({ ...it, discount: 0 })),
          subtotal: subtotal,
          taxRate: data.taxRate,
          taxAmount: taxAmount,
          total: total,
          status: data.status as QuotationStatus,
          terms: data.terms || "",
          notes: data.notes || "",
        }),
      })
      if (!res.ok) throw new Error("Update failed")
      const updatedQuotation = await res.json()

      toast({
        title: "Success",
        description: `Quotation ${updatedQuotation.quotationNumber} updated successfully.`,
        variant: "success",
      })
      
      // Check if there's no Purchase Order linked, show modal to create one
      const poRes = await fetch('/api/purchase-orders')
      const allPOs = poRes.ok ? await poRes.json() : []
      const relatedPOs = (allPOs || []).filter((po: any) => po.quotationId === updatedQuotation.id)
      if (relatedPOs.length === 0) {
        setShowCreatePOModal(true)
      } else {
        router.push(`/quotations/${updatedQuotation.id}`)
      }
    } catch (error) {
      console.error("Error updating quotation:", error)
      toast({
        title: "Error",
        description: "Failed to update quotation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner text="Loading quotation..." />
      </div>
    )
  }

  if (!quotation) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-4">Quotation not found</p>
          <Button onClick={() => router.push('/quotations')} variant="outline">
            Back to Quotations
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Edit Quotation ${quotation.quotationNumber}`}
        description="Update quotation details"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer and Basic Info */}
        <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded"></span>
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="customerId" className="text-blue-900 dark:text-blue-100 font-medium">
                  Customer *
                </Label>
                <Select
                  value={watch("customerId")}
                  onValueChange={(value) => setValue("customerId", value)}
                >
                  <SelectTrigger className="h-12 border-2 border-blue-400 dark:border-blue-800/60">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.customerId && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.customerId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date" className="text-blue-900 dark:text-blue-100 font-medium">Quotation Date</Label>
                <Input
                  id="date"
                  type="date"
                  {...register("date")}
                  className="h-12 border-2 border-blue-400 dark:border-blue-800/60"
                />
                {errors.date && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil" className="text-blue-900 dark:text-blue-100 font-medium">Valid Until</Label>
                <Input
                  id="validUntil"
                  type="date"
                  {...register("validUntil")}
                  className="h-12 border-2 border-blue-400 dark:border-blue-800/60"
                />
                {errors.validUntil && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.validUntil.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingType" className="text-blue-900 dark:text-blue-100 font-medium">Billing Type</Label>
                <Select
                  value={watch("billingType")}
                  onValueChange={(value) => setValue("billingType", value as "hours" | "days" | "quantity")}
                >
                  <SelectTrigger className="h-12 border-2 border-blue-400 dark:border-blue-800/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quantity">Quantity</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate" className="text-blue-900 dark:text-blue-100 font-medium">VAT Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  {...register("taxRate", { valueAsNumber: true })}
                  className="h-12 border-2 border-blue-400 dark:border-blue-800/60"
                />
                {errors.taxRate && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.taxRate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-blue-900 dark:text-blue-100 font-medium">Status</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value) => setValue("status", value as QuotationStatus)}
                >
                  <SelectTrigger className="h-12 border-2 border-blue-400 dark:border-blue-800/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items Table */}
        <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <span className="w-1 h-6 bg-gold rounded"></span>
                Items
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addItem}
                className="border-blue-300 dark:border-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {errors.items && (
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">{errors.items.message}</p>
            )}
            <div className="overflow-x-auto w-full">
              <Table className="w-full min-w-full">
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-b-2 border-blue-400 dark:border-blue-600">
                    <TableHead className="font-bold text-white text-left">Description *</TableHead>
                    {watchedBillingType === 'hours' && (
                      <TableHead className="font-bold text-white">Hours</TableHead>
                    )}
                    {watchedBillingType === 'days' && (
                      <TableHead className="font-bold text-white">Days</TableHead>
                    )}
                    {watchedBillingType === 'quantity' && (
                      <TableHead className="font-bold text-white">Quantity</TableHead>
                    )}
                    <TableHead className="font-bold text-white">Unit Price</TableHead>
                    <TableHead className="font-bold text-white text-right">Total</TableHead>
                    <TableHead className="font-bold text-white text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => {
                    const item = (watchedItems || [])[index]
                    const itemTotal = calculateItemTotal(item, index)
                    
                    return (
                      <TableRow key={field.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/30">
                        <TableCell>
                          <Input
                            {...register(`items.${index}.description`)}
                            placeholder="Item description"
                            className="border-2 border-blue-400 dark:border-blue-800/60"
                          />
                          {errors.items?.[index]?.description && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                              {errors.items[index]?.description?.message}
                            </p>
                          )}
                        </TableCell>
                        {watchedBillingType === 'hours' && (
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`items.${index}.hours`, { valueAsNumber: true })}
                              className="border-2 border-blue-400 dark:border-blue-800/60"
                            />
                          </TableCell>
                        )}
                        {watchedBillingType === 'days' && (
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`items.${index}.days`, { valueAsNumber: true })}
                              className="border-2 border-blue-400 dark:border-blue-800/60"
                            />
                          </TableCell>
                        )}
                        {watchedBillingType === 'quantity' && (
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                              className="border-2 border-blue-400 dark:border-blue-800/60"
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                            className="border-2 border-blue-400 dark:border-blue-800/60"
                          />
                        </TableCell>
                        <TableCell className="text-right font-semibold text-blue-900 dark:text-blue-100">
                          {formatCurrency(itemTotal)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  <TableRow className="bg-blue-50 dark:bg-blue-900/50 font-bold border-t-2 border-blue-300 dark:border-blue-700">
                    <TableCell colSpan={3} className="text-right">
                      Subtotal:
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(subtotal)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow className="bg-blue-50 dark:bg-blue-900/50 font-bold">
                    <TableCell colSpan={3} className="text-right">
                      VAT ({watchedTaxRate}%):
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(taxAmount)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                  <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-t-2 border-blue-400 dark:border-blue-600">
                    <TableCell colSpan={3} className="text-right text-lg font-bold text-white">
                      Total:
                    </TableCell>
                    <TableCell className="text-right text-lg font-bold text-white">{formatCurrency(total)}</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Notes */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card p-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <span className="w-1 h-6 bg-gold rounded"></span>
                Terms & Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register("terms")}
                rows={6}
                placeholder="Enter terms and conditions..."
                className="border-2 border-blue-400 dark:border-blue-800/60"
              />
            </CardContent>
          </Card>

          <Card className="border-2 border-gold/60 dark:border-gold/40 shadow-gold p-6">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                <span className="w-1 h-6 bg-gold rounded"></span>
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                {...register("notes")}
                rows={6}
                placeholder="Additional notes..."
                className="border-2 border-blue-400 dark:border-blue-800/60"
              />
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 font-semibold px-6 py-3"
          >
            <X className="mr-2 h-5 w-5" />
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-8 py-3"
          >
            {isSubmitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-5 w-5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Create Purchase Order Modal */}
      <Modal
        isOpen={showCreatePOModal}
        onClose={() => {
          setShowCreatePOModal(false)
          if (quotation) {
            router.push(`/quotations/${quotation.id}`)
          }
        }}
        title="Create Purchase Order"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Quotation has been updated successfully! Would you like to create a Purchase Order from this quotation?
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreatePOModal(false)
                if (quotation) {
                  router.push(`/quotations/${quotation.id}`)
                }
              }}
              className="border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 font-semibold px-6 py-2"
            >
              Skip for Now
            </Button>
            <Button
              type="button"
              variant="gold"
              onClick={() => {
                setShowCreatePOModal(false)
                if (quotation) {
                  router.push(`/purchase-orders/new?fromQuotation=${quotation.id}`)
                }
              }}
              className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-6 py-2"
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Create Purchase Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
