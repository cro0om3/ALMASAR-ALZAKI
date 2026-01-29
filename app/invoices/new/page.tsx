"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { Plus, Trash2, X } from "lucide-react"
import { InvoiceItem } from "@/types"
import { formatCurrency, numberToWords } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/shared/PageHeader"

const invoiceSchema = z.object({
  customerId: z.string().optional(),
  date: z.string().optional(),
  dueDate: z.string().optional(),
  billingType: z.enum(["hours", "days", "quantity"]).optional(), // Billing type for entire invoice
  projectName: z.string().optional(),
  lpoNumber: z.string().optional(),
  scopeOfWork: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().optional(),
      quantity: z.number().min(0.01, "Quantity must be greater than 0").optional(),
      unitPrice: z.number().min(0, "Unit price must be 0 or greater").optional(),
      tax: z.number().min(0).max(100).optional(),
      hours: z.number().min(0).optional(),
      days: z.number().min(0).optional(),
      vehicleNumber: z.string().optional(),
    })
  ).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

function InvoiceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const purchaseOrderId = searchParams.get("fromPO")
  const FIXED_TAX_RATE = 5
  const [customers, setCustomers] = useState<any[]>([])
  const [quotation, setQuotation] = useState<any>(null)
  const [purchaseOrder, setPurchaseOrder] = useState<any>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customerId: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      billingType: "quantity",
      items: [{ description: "", quantity: 1, unitPrice: 0, tax: 0 }],
      taxRate: FIXED_TAX_RATE,
      terms: "",
      notes: "",
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  })

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const custRes = await fetch('/api/customers')
      const customersList = custRes.ok ? await custRes.json() : []
      if (!cancelled) setCustomers(customersList || [])
      if (purchaseOrderId) {
        const poRes = await fetch(`/api/purchase-orders/${purchaseOrderId}`)
        const po = poRes.ok ? await poRes.json() : null
        if (!cancelled && po) {
          setPurchaseOrder(po)
          if (po.customerId) setValue("customerId", po.customerId)
          if (po.quotationId) {
            const qRes = await fetch(`/api/quotations/${po.quotationId}`)
            const q = qRes.ok ? await qRes.json() : null
            if (q) setQuotation(q)
          }
          setValue("taxRate", FIXED_TAX_RATE)
          setValue("terms", po.terms || "")
          setValue("notes", po.notes || "")
          setValue("lpoNumber", po.orderNumber)
          const items = (po.items || []).map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            tax: item.tax,
            hours: undefined,
            days: undefined,
          }))
          replace(items.length ? items : [{ description: "", quantity: 1, unitPrice: 0, tax: 0 }])
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [purchaseOrderId, setValue, replace])

  const watchedItems = watch("items")
  const watchedBillingType = watch("billingType")

  // Compute subtotal, tax, total from form values so they update immediately (like Quotation)
  const { subtotal, taxAmount, total } = (() => {
    const billingType = watchedBillingType || 'quantity'
    let sum = 0
    ;(watchedItems || []).forEach((item) => {
      let itemTotal = 0
      if (billingType === 'hours' && item?.hours) itemTotal = item.hours * (Number(item?.unitPrice) || 0)
      else if (billingType === 'days' && item?.days) itemTotal = item.days * (Number(item?.unitPrice) || 0)
      else itemTotal = (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0)
      sum += itemTotal
    })
    const tax = (sum * FIXED_TAX_RATE) / 100
    return { subtotal: sum, taxAmount: tax, total: sum + tax }
  })()

  const addItem = () => {
    append({ description: "", quantity: 1, unitPrice: 0, tax: 0 })
  }

  const onSubmit = async (data: InvoiceFormData) => {
    try {
    const billingType = data.billingType || 'quantity'
    const items: any[] = (data.items || []).map((item, index) => {
      // Calculate based on invoice's billing type
      let itemTotal = 0
      let quantity = 0
      
      const unitPrice = item.unitPrice ?? 0
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
      const itemTax = (itemTotal * FIXED_TAX_RATE) / 100
      return {
        id: `item-${index}`,
        description: item.description ?? '',
        quantity: quantity,
        unitPrice: unitPrice,
        tax: FIXED_TAX_RATE,
        total: itemTotal + itemTax,
        hours: item.hours,
        days: item.days,
        billingType: billingType,
        vehicleNumber: item.vehicleNumber,
        grossAmount: itemTotal,
      }
    })

    const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10)}-${Math.random().toString(36).slice(2, 9)}`
    const invoiceData = {
      invoiceNumber,
      quotationId: purchaseOrder?.quotationId || undefined,
      purchaseOrderId: purchaseOrderId || undefined,
      customerId: data.customerId,
      date: data.date,
      dueDate: data.dueDate,
      billingType: billingType,
      projectName: data.projectName || "",
      lpoNumber: data.lpoNumber || "",
      scopeOfWork: data.scopeOfWork || "",
      items: items.map((it: any) => ({ ...it, discount: it.discount ?? 0 })),
      subtotal,
      taxRate: FIXED_TAX_RATE,
      taxAmount,
      total,
      paidAmount: 0,
      status: "draft" as const,
      terms: data.terms || "",
      notes: data.notes || "",
      amountInWords: numberToWords(total),
    }
    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoiceData),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.error || 'Failed to create invoice')
    }
    router.push("/invoices")
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Failed to create invoice')
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer and Basic Info */}
        <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card p-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
              <span className="w-1 h-6 bg-gold rounded"></span>
              Invoice Details
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
                <Label htmlFor="date" className="text-blue-900 dark:text-blue-100 font-medium">Date</Label>
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
                <Label htmlFor="dueDate" className="text-blue-900 dark:text-blue-100 font-medium">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  {...register("dueDate")}
                  className="h-12 border-2 border-blue-400 dark:border-blue-800/60"
                />
                {errors.dueDate && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.dueDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxRate" className="text-blue-900 dark:text-blue-100 font-medium">VAT Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  readOnly
                  value={FIXED_TAX_RATE}
                  className="h-12 border-2 border-blue-400 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-900/30 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingType" className="text-blue-900 dark:text-blue-100 font-medium">Rental Time / Billing Type</Label>
                <Select
                  value={watch("billingType") || "quantity"}
                  onValueChange={(value) => setValue("billingType", value as "hours" | "days" | "quantity")}
                >
                  <SelectTrigger className="h-12 border-2 border-blue-400 dark:border-blue-800/60">
                    <SelectValue placeholder="Select rental time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hourly (By Hours)</SelectItem>
                    <SelectItem value="days">Daily (By Days)</SelectItem>
                    <SelectItem value="quantity">By Quantity</SelectItem>
                  </SelectContent>
                </Select>
                {errors.billingType && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errors.billingType.message}</p>
                )}
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
                  <TableHead className="font-bold text-white">Description</TableHead>
                  <TableHead className="font-bold text-white">Vehicle#</TableHead>
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
                  <TableHead className="font-bold text-white">Total</TableHead>
                  <TableHead className="font-bold text-white"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const item = (watchedItems || [])[index]
                  const billingType = watchedBillingType || 'quantity'
                  const unitPrice = item?.unitPrice ?? 0
                  let itemTotal = 0
                  if (billingType === 'hours' && item?.hours) {
                    itemTotal = item.hours * unitPrice
                  } else if (billingType === 'days' && item?.days) {
                    itemTotal = item.days * unitPrice
                  } else if (billingType === 'quantity' && item?.quantity) {
                    itemTotal = item.quantity * unitPrice
                  }
                  const itemTax = (itemTotal * FIXED_TAX_RATE) / 100
                  const itemFinalTotal = itemTotal + itemTax

                  return (
                    <TableRow key={field.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/30">
                      <TableCell>
                        <Input
                          {...register(`items.${index}.description`)}
                          placeholder="Item description"
                          className="min-w-[200px] border-2 border-blue-400 dark:border-blue-800/60"
                        />
                        {errors.items?.[index]?.description && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                            {errors.items[index]?.description?.message}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          {...register(`items.${index}.vehicleNumber`)}
                          placeholder="Vehicle #"
                          className="w-24 border-2 border-blue-400 dark:border-blue-800/60"
                        />
                      </TableCell>
                      {billingType === 'hours' && (
                        <TableCell>
                          <Input
                            type="number"
                            step="0.5"
                            {...register(`items.${index}.hours`, { valueAsNumber: true })}
                            placeholder="Hours"
                            className="w-24 border-2 border-blue-400 dark:border-blue-800/60"
                          />
                        </TableCell>
                      )}
                      {billingType === 'days' && (
                        <TableCell>
                          <Input
                            type="number"
                            step="0.5"
                            {...register(`items.${index}.days`, { valueAsNumber: true })}
                            placeholder="Days"
                            className="w-24 border-2 border-blue-400 dark:border-blue-800/60"
                          />
                        </TableCell>
                      )}
                      {billingType === 'quantity' && (
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                            placeholder="Qty"
                            className="w-24 border-2 border-blue-400 dark:border-blue-800/60"
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                          placeholder="Price"
                          className="w-28 border-2 border-blue-400 dark:border-blue-800/60"
                        />
                      </TableCell>
                      <TableCell className="text-right font-semibold text-blue-900 dark:text-blue-100">{formatCurrency(itemFinalTotal)}</TableCell>
                      <TableCell className="text-right">
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
                {(() => {
                  // Vehicle# always visible: Description + Vehicle# + (Hours|Days|Quantity) + Unit Price = 4
                  const colSpan = 4
                  return (
                    <>
                      <TableRow className="bg-blue-50 dark:bg-blue-900/50 font-bold border-t-2 border-blue-300 dark:border-blue-700">
                        <TableCell colSpan={colSpan} className="text-right">Subtotal:</TableCell>
                        <TableCell className="text-right">{formatCurrency(subtotal)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow className="bg-blue-50 dark:bg-blue-900/50 font-bold">
                        <TableCell colSpan={colSpan} className="text-right">Tax ({FIXED_TAX_RATE}%):</TableCell>
                        <TableCell className="text-right">{formatCurrency(taxAmount)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                      <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-t-2 border-blue-400 dark:border-blue-600">
                        <TableCell colSpan={colSpan} className="text-right text-lg font-bold text-white">Total:</TableCell>
                        <TableCell className="text-right text-lg font-bold text-white">{formatCurrency(total)}</TableCell>
                        <TableCell></TableCell>
                      </TableRow>
                    </>
                  )
                })()}
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
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-8 py-3"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create Invoice
          </Button>
        </div>
      </form>
    </div>
  )
}

function NewInvoicePageContent() {
  const searchParams = useSearchParams()
  const fromPO = searchParams.get("fromPO")
  return (
    <div className="space-y-8">
      <PageHeader
        title="New Invoice"
        description={fromPO ? "Create invoice from purchase order" : "Create a new invoice"}
      />
      <InvoiceForm />
    </div>
  )
}

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <NewInvoicePageContent />
    </Suspense>
  )
}
