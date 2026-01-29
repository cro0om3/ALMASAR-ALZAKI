"use client"

import { useState, useEffect } from "react"
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
import { Vendor, Customer, Quotation, PurchaseOrderItem } from "@/types"
import { formatCurrency } from "@/lib/utils"

const purchaseOrderSchema = z.object({
  poType: z.enum(["vendor", "customer"]).optional(),
  vendorId: z.string().optional(),
  customerId: z.string().optional(),
  quotationId: z.string().optional(),
  date: z.string().optional(),
  expectedDelivery: z.string().optional(),
  items: z.array(
    z.object({
      description: z.string().optional(),
      quantity: z.number().min(0.01, "Quantity must be greater than 0").optional(),
      unitPrice: z.number().min(0, "Unit price must be 0 or greater").optional(),
      tax: z.number().min(0).max(100).optional(),
    })
  ).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
})

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>

interface PurchaseOrderFormProps {
  order?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export function PurchaseOrderForm({ order, onSubmit, onCancel }: PurchaseOrderFormProps) {
  const [poType, setPoType] = useState<"vendor" | "customer">(order?.vendorId ? "vendor" : "customer")
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const FIXED_TAX_RATE = 5

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: order
      ? { ...order, taxRate: FIXED_TAX_RATE }
      : {
          poType: order?.vendorId ? "vendor" : "customer",
          vendorId: "",
          customerId: order?.customerId || "",
          quotationId: order?.quotationId || "",
          date: new Date().toISOString().split("T")[0],
          expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
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
      const [vRes, cRes, qRes] = await Promise.all([
        fetch('/api/vendors'),
        fetch('/api/customers'),
        fetch('/api/quotations'),
      ])
      if (cancelled) return
      const vList = vRes.ok ? await vRes.json() : []
      const cList = cRes.ok ? await cRes.json() : []
      const qList = qRes.ok ? await qRes.json() : []
      setVendors(vList || [])
      setCustomers(cList || [])
      setQuotations((qList || []).filter((q: Quotation) => q.status !== 'rejected' && q.status !== 'expired'))
      if (order?.quotationId) {
        const q = (qList || []).find((x: Quotation) => x.id === order.quotationId)
        if (q) {
          setSelectedQuotation(q)
          const items = (q.items || []).map((item: any) => {
            let quantity = item.quantity
            if (q.billingType === 'hours' && item.hours) quantity = item.hours
            else if (q.billingType === 'days' && item.days) quantity = item.days
            return {
              description: item.description,
              quantity,
              unitPrice: item.unitPrice,
              tax: item.tax || 0,
            }
          })
          if (items.length > 0) replace(items)
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [order, replace])

  const handlePoTypeChange = (type: "vendor" | "customer") => {
    setPoType(type)
    setValue("poType", type)
    setValue("vendorId", "")
    setValue("customerId", "")
    setValue("quotationId", "")
    setSelectedQuotation(null)
  }

  const handleQuotationChange = (quotationId: string) => {
    if (quotationId === "none") {
      setValue("quotationId", "")
      setSelectedQuotation(null)
      return
    }
    setValue("quotationId", quotationId)
    const quotation = quotations.find(q => q.id === quotationId)
    if (quotation) {
      setSelectedQuotation(quotation)
      setValue("customerId", quotation.customerId)
      setValue("taxRate", FIXED_TAX_RATE)
      
      // Copy items from quotation - handle different billing types
      const quotationItems = quotation.items.map(item => {
        // Determine quantity based on billing type
        let quantity = item.quantity
        if (quotation.billingType === 'hours' && item.hours) {
          quantity = item.hours
        } else if (quotation.billingType === 'days' && item.days) {
          quantity = item.days
        }
        
        return {
          description: item.description,
          quantity: quantity,
          unitPrice: item.unitPrice,
          tax: item.tax || 0,
        }
      })
      replace(quotationItems.length > 0 ? quotationItems : [{ description: "", quantity: 1, unitPrice: 0, tax: 0 }])
    }
  }

  const watchedItems = watch("items")
  const watchedTaxRate = watch("taxRate")

  // Compute subtotal, tax, total from form values so they update immediately (like Quotation)
  const { subtotal, taxAmount, total } = (() => {
    let sub = 0
    ;(watchedItems || []).forEach((item) => {
      sub += (Number(item?.quantity) || 0) * (Number(item?.unitPrice) || 0)
    })
    const rate = FIXED_TAX_RATE
    const tax = (sub * rate) / 100
    return { subtotal: sub, taxAmount: tax, total: sub + tax }
  })()

  const addItem = () => {
    append({ description: "", quantity: 1, unitPrice: 0, tax: 0 })
  }

  const onFormSubmit = (data: PurchaseOrderFormData) => {
    // Validation: ensure vendorId or customerId is provided
    if (data.poType === "vendor" && !data.vendorId) {
      setValue("vendorId", "", { shouldValidate: true })
      return
    }
    if (data.poType === "customer" && !data.customerId) {
      setValue("customerId", "", { shouldValidate: true })
      return
    }

    const items: PurchaseOrderItem[] = (data.items || []).map((item, index) => {
      const qty = item.quantity ?? 0
      const price = item.unitPrice ?? 0
      const itemTotal = qty * price
      const itemTax = (itemTotal * FIXED_TAX_RATE) / 100
      return {
        id: `item-${index}`,
        description: item.description ?? '',
        quantity: qty,
        unitPrice: price,
        tax: FIXED_TAX_RATE,
        total: itemTotal + itemTax,
      }
    })

    const orderData: any = {
      orderNumber: order?.orderNumber || `PO-${Date.now()}`,
      date: data.date,
      expectedDelivery: data.expectedDelivery,
      items,
      subtotal,
      taxRate: FIXED_TAX_RATE,
      taxAmount,
      total,
      status: order?.status || (data.poType === "customer" ? "received" : "draft"),
      terms: data.terms || "",
      notes: data.notes || "",
    }

    if (data.poType === "vendor") {
      if (!data.vendorId) {
        alert("Please select a vendor")
        return
      }
      orderData.vendorId = data.vendorId
    } else {
      if (!data.customerId) {
        alert("Please select a customer")
        return
      }
      orderData.customerId = data.customerId
      if (data.quotationId) {
        orderData.quotationId = data.quotationId
      }
    }

    onSubmit(orderData)
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="poType">PO Type</Label>
          <Select
            value={poType}
            onValueChange={(value: "vendor" | "customer") => handlePoTypeChange(value)}
          >
            <SelectTrigger className="border-2 border-blue-400 dark:border-blue-800/60">
              <SelectValue placeholder="Select PO type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">Customer PO (من عميل)</SelectItem>
              <SelectItem value="vendor">Vendor PO (من مورد)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {poType === "vendor" ? (
          <div className="space-y-2">
            <Label htmlFor="vendorId">Vendor</Label>
            <Select
              value={watch("vendorId") || ""}
              onValueChange={(value) => setValue("vendorId", value)}
            >
              <SelectTrigger className="border-2 border-blue-400 dark:border-blue-800/60">
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vendorId && (
              <p className="text-sm text-destructive">{errors.vendorId.message}</p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="quotationId">Quotation (اختياري)</Label>
              <Select
                value={watch("quotationId") || ""}
                onValueChange={(value) => handleQuotationChange(value)}
              >
                <SelectTrigger className="border-2 border-blue-400 dark:border-blue-800/60">
                  <SelectValue placeholder="Select quotation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {quotations.map((quotation) => {
                    const customer = customers.find(c => c.id === quotation.customerId)
                    return (
                      <SelectItem key={quotation.id} value={quotation.id}>
                        {quotation.quotationNumber} - {customer?.name || "N/A"} ({quotation.status})
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerId">Customer</Label>
              <Select
                value={watch("customerId") || ""}
                onValueChange={(value) => setValue("customerId", value)}
                disabled={!!selectedQuotation}
              >
                <SelectTrigger className="border-2 border-blue-400 dark:border-blue-800/60">
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
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input type="date" className="border-2 border-blue-400 dark:border-blue-800/60" {...register("date")} />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedDelivery">Expected Delivery</Label>
          <Input type="date" className="border-2 border-blue-400 dark:border-blue-800/60" {...register("expectedDelivery")} />
          {errors.expectedDelivery && (
            <p className="text-sm text-destructive">{errors.expectedDelivery.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <Input
            type="number"
            readOnly
            value={FIXED_TAX_RATE}
            className="border-2 border-blue-400 dark:border-blue-800/60 bg-blue-50/50 dark:bg-blue-900/30 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Items</Label>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        <div className="rounded-md border-2 border-blue-400 dark:border-blue-800/60 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-b-2 border-blue-400 dark:border-blue-600">
                <TableHead className="font-bold text-white">Description</TableHead>
                <TableHead className="font-bold text-white">Quantity</TableHead>
                <TableHead className="font-bold text-white">Unit Price</TableHead>
                <TableHead className="font-bold text-white">Total</TableHead>
                <TableHead className="font-bold text-white"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const item = (watchedItems || [])[index]
                if (!item) return null
                const itemTotal = (item.quantity ?? 0) * (item.unitPrice ?? 0)
                const itemTax = (itemTotal * FIXED_TAX_RATE) / 100
                const itemFinalTotal = itemTotal + itemTax

                return (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Input
                        {...register(`items.${index}.description`)}
                        placeholder="Item description"
                      />
                      {errors.items?.[index]?.description && (
                        <p className="text-xs text-destructive">
                          {errors.items[index]?.description?.message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-2 border-blue-400 dark:border-blue-800/60"
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        className="border-2 border-blue-400 dark:border-blue-800/60"
                        {...register(`items.${index}.unitPrice`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell className="text-right font-semibold text-blue-900 dark:text-blue-100">{formatCurrency(itemFinalTotal)}</TableCell>
                    <TableCell>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              <TableRow className="bg-blue-50 dark:bg-blue-900/50 font-bold border-t-2 border-blue-300 dark:border-blue-700">
                <TableCell colSpan={3} className="text-right">Subtotal:</TableCell>
                <TableCell className="text-right">{formatCurrency(subtotal)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow className="bg-blue-50 dark:bg-blue-900/50 font-bold">
                <TableCell colSpan={3} className="text-right">Tax ({FIXED_TAX_RATE}%):</TableCell>
                <TableCell className="text-right">{formatCurrency(taxAmount)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
              <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-t-2 border-blue-400 dark:border-blue-600">
                <TableCell colSpan={3} className="text-right text-lg font-bold text-white">Total:</TableCell>
                <TableCell className="text-right text-lg font-bold text-white">{formatCurrency(total)}</TableCell>
                <TableCell></TableCell>
              </TableRow>
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
          <Textarea className="border-2 border-blue-400 dark:border-blue-800" {...register("terms")} rows={4} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea className="border-2 border-blue-400 dark:border-blue-800" {...register("notes")} rows={4} />
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit"
          variant="gold"
          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-8 py-3"
        >
          Save Purchase Order
        </Button>
      </div>
    </form>
  )
}
