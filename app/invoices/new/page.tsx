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
import { Plus, Trash2 } from "lucide-react"
import { invoiceService, quotationService, customerService, purchaseOrderService, settingsService } from "@/lib/data"
import { InvoiceItem } from "@/types"
import { formatCurrency, numberToWords } from "@/lib/utils"
import { Card } from "@/components/ui/card"

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  date: z.string().min(1, "Date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  billingType: z.enum(["hours", "days", "quantity"]), // Billing type for entire invoice
  projectName: z.string().optional(),
  lpoNumber: z.string().optional(),
  scopeOfWork: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required"),
      quantity: z.number().min(0.01, "Quantity must be greater than 0").optional(),
      unitPrice: z.number().min(0, "Unit price must be 0 or greater"),
      discount: z.number().min(0).max(100),
      tax: z.number().min(0).max(100),
      hours: z.number().min(0).optional(),
      days: z.number().min(0).optional(),
      vehicleNumber: z.string().optional(),
    })
  ).min(1, "At least one item is required"),
  taxRate: z.number().min(0).max(100),
  terms: z.string().optional(),
  notes: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

function InvoiceForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const purchaseOrderId = searchParams.get("fromPO")
  const [customers, setCustomers] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [total, setTotal] = useState(0)
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
      items: [{ description: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0 }],
      taxRate: 5, // Default VAT 5%
      terms: "",
      notes: "",
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  })

  useEffect(() => {
    setCustomers(customerService.getAll())
    
    if (purchaseOrderId) {
      const po = purchaseOrderService.getById(purchaseOrderId)
      if (po) {
        setPurchaseOrder(po)
        if (po.customerId) {
          setValue("customerId", po.customerId)
        }
        if (po.quotationId) {
          const q = quotationService.getById(po.quotationId)
          if (q) {
            setQuotation(q)
            // quotationId is stored in invoiceData but not in form schema
          }
        }
        setValue("taxRate", po.taxRate)
        setValue("terms", po.terms || "")
        setValue("notes", po.notes || "")
        setValue("lpoNumber", po.orderNumber)
        
        const invoiceItems = po.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          tax: item.tax,
          hours: undefined,
          days: undefined,
        }))
        replace(invoiceItems)
      }
    }
  }, [purchaseOrderId, setValue, replace])

  const watchedItems = watch("items")
  const watchedTaxRate = watch("taxRate")
  const watchedBillingType = watch("billingType")

  useEffect(() => {
    let sub = 0
    watchedItems.forEach((item) => {
      const billingType = watchedBillingType || 'quantity'
      let itemTotal = 0
      
      if (billingType === 'hours' && item.hours) {
        itemTotal = item.hours * item.unitPrice
      } else if (billingType === 'days' && item.days) {
        itemTotal = item.days * item.unitPrice
      } else if (billingType === 'quantity' && item.quantity) {
        itemTotal = item.quantity * item.unitPrice
      }
      
      const discountAmount = (itemTotal * item.discount) / 100
      const afterDiscount = itemTotal - discountAmount
      sub += afterDiscount
    })
    setSubtotal(sub)
    const tax = (sub * watchedTaxRate) / 100
    setTaxAmount(tax)
    setTotal(sub + tax)
  }, [watchedItems, watchedTaxRate, watchedBillingType])

  const addItem = () => {
    append({ description: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0 })
  }

  const onSubmit = (data: InvoiceFormData) => {
    const billingType = data.billingType || 'quantity'
    
    const items: any[] = data.items.map((item, index) => {
      // Calculate based on invoice's billing type
      let itemTotal = 0
      let quantity = 0
      
      if (billingType === 'hours' && item.hours) {
        itemTotal = item.hours * item.unitPrice
        quantity = item.hours
      } else if (billingType === 'days' && item.days) {
        itemTotal = item.days * item.unitPrice
        quantity = item.days
      } else if (billingType === 'quantity' && item.quantity) {
        itemTotal = item.quantity * item.unitPrice
        quantity = item.quantity
      }
      
      const discountAmount = (itemTotal * item.discount) / 100
      const afterDiscount = itemTotal - discountAmount
      const itemTax = (afterDiscount * item.tax) / 100
      
      return {
        id: `item-${index}`,
        description: item.description,
        quantity: quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        total: afterDiscount + itemTax,
        hours: item.hours,
        days: item.days,
        billingType: billingType,
        vehicleNumber: item.vehicleNumber,
        grossAmount: itemTotal,
      }
    })

    const invoiceData = {
      invoiceNumber: settingsService.generateInvoiceNumber(),
      quotationId: purchaseOrder?.quotationId || undefined,
      purchaseOrderId: purchaseOrderId || undefined, // Link to Purchase Order
      customerId: data.customerId,
      date: data.date,
      dueDate: data.dueDate,
      billingType: billingType,
      projectName: data.projectName || "",
      lpoNumber: data.lpoNumber || "",
      scopeOfWork: data.scopeOfWork || "",
      items,
      subtotal,
      taxRate: data.taxRate,
      taxAmount,
      discount: 0,
      total,
      paidAmount: 0,
      status: "draft" as const,
      terms: data.terms || "",
      notes: data.notes || "",
      amountInWords: numberToWords(total),
    }

    invoiceService.create(invoiceData)
    router.push("/invoices")
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-8 md:p-10 rounded-2xl shadow-luxury">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">New Invoice</h1>
          <p className="text-blue-100 text-lg font-medium">
            {purchaseOrderId ? "Create invoice from purchase order" : "Create a new invoice"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="customerId">Customer *</Label>
            <Select
              value={watch("customerId")}
              onValueChange={(value) => setValue("customerId", value)}
            >
              <SelectTrigger>
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
              <p className="text-sm text-destructive">{errors.customerId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input type="date" {...register("date")} />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input type="date" {...register("dueDate")} />
            {errors.dueDate && (
              <p className="text-sm text-destructive">{errors.dueDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxRate">VAT Rate (%)</Label>
            <Input
              type="number"
              step="0.01"
              {...register("taxRate", { valueAsNumber: true })}
              placeholder="5"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="billingType">Rental Time / Billing Type *</Label>
            <Select
              value={watch("billingType") || "quantity"}
              onValueChange={(value) => setValue("billingType", value as "hours" | "days" | "quantity")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select rental time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hours">Hourly (By Hours)</SelectItem>
                <SelectItem value="days">Daily (By Days)</SelectItem>
                <SelectItem value="quantity">By Quantity</SelectItem>
              </SelectContent>
            </Select>
            {errors.billingType && (
              <p className="text-sm text-destructive">{errors.billingType.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Items *</Label>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100/50">
                  <TableHead className="font-bold text-blue-900">Description</TableHead>
                  {(watchedBillingType === 'hours' || watchedBillingType === 'days') && (
                    <TableHead className="font-bold text-blue-900">Vehicle#</TableHead>
                  )}
                  {watchedBillingType === 'hours' && (
                    <TableHead className="font-bold text-blue-900">Hours</TableHead>
                  )}
                  {watchedBillingType === 'days' && (
                    <TableHead className="font-bold text-blue-900">Days</TableHead>
                  )}
                  {watchedBillingType === 'quantity' && (
                    <TableHead className="font-bold text-blue-900">Quantity</TableHead>
                  )}
                  <TableHead className="font-bold text-blue-900">Unit Price</TableHead>
                  <TableHead className="font-bold text-blue-900">Discount %</TableHead>
                  <TableHead className="font-bold text-blue-900">Tax %</TableHead>
                  <TableHead className="font-bold text-blue-900">Total</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => {
                  const item = watchedItems[index]
                  const billingType = watchedBillingType || 'quantity'
                  
                  // Calculate based on invoice's billing type
                  let itemTotal = 0
                  if (billingType === 'hours' && item.hours) {
                    itemTotal = item.hours * item.unitPrice
                  } else if (billingType === 'days' && item.days) {
                    itemTotal = item.days * item.unitPrice
                  } else if (billingType === 'quantity' && item.quantity) {
                    itemTotal = item.quantity * item.unitPrice
                  }
                  
                  const discountAmount = (itemTotal * item.discount) / 100
                  const afterDiscount = itemTotal - discountAmount
                  const itemTax = (afterDiscount * item.tax) / 100
                  const itemFinalTotal = afterDiscount + itemTax

                  return (
                    <TableRow key={field.id}>
                      <TableCell>
                        <Input
                          {...register(`items.${index}.description`)}
                          placeholder="Item description"
                          className="min-w-[200px]"
                        />
                        {errors.items?.[index]?.description && (
                          <p className="text-xs text-red-600">
                            {errors.items[index]?.description?.message}
                          </p>
                        )}
                      </TableCell>
                      {(billingType === 'hours' || billingType === 'days') && (
                        <TableCell>
                          <Input
                            {...register(`items.${index}.vehicleNumber`)}
                            placeholder="Vehicle #"
                            className="w-24"
                          />
                        </TableCell>
                      )}
                      {billingType === 'hours' && (
                        <TableCell>
                          <Input
                            type="number"
                            step="0.5"
                            {...register(`items.${index}.hours`, {
                              valueAsNumber: true,
                            })}
                            placeholder="Hours"
                            className="w-24"
                          />
                        </TableCell>
                      )}
                      {billingType === 'days' && (
                        <TableCell>
                          <Input
                            type="number"
                            step="0.5"
                            {...register(`items.${index}.days`, {
                              valueAsNumber: true,
                            })}
                            placeholder="Days"
                            className="w-24"
                          />
                        </TableCell>
                      )}
                      {billingType === 'quantity' && (
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            {...register(`items.${index}.quantity`, {
                              valueAsNumber: true,
                            })}
                            placeholder="Qty"
                            className="w-24"
                          />
                        </TableCell>
                      )}
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.unitPrice`, {
                            valueAsNumber: true,
                          })}
                          placeholder="Price"
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.discount`, {
                            valueAsNumber: true,
                          })}
                          placeholder="%"
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          {...register(`items.${index}.tax`, {
                            valueAsNumber: true,
                          })}
                          placeholder="%"
                          className="w-20"
                        />
                      </TableCell>
                      <TableCell className="font-semibold text-blue-900">{formatCurrency(itemFinalTotal)}</TableCell>
                      <TableCell>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {errors.items && (
            <p className="text-sm text-destructive">{errors.items.message}</p>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions</Label>
            <Textarea {...register("terms")} rows={4} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea {...register("notes")} rows={4} />
          </div>
        </div>

        <div className="rounded-md border p-4">
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span>Tax ({watchedTaxRate}%):</span>
            <span>{formatCurrency(taxAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-2 border-t">
            <span>Total:</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-4">
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
          >
            Create Invoice
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function NewInvoicePage() {
  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-8 md:p-10 rounded-2xl shadow-luxury">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">New Invoice</h1>
          <p className="text-blue-100 text-lg font-medium">Create a new invoice</p>
        </div>
      </div>
      <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
        <InvoiceForm />
      </Suspense>
    </div>
  )
}
