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
import { vendorService, customerService, quotationService } from "@/lib/data"
import { Vendor, Customer, Quotation, PurchaseOrderItem } from "@/types"
import { formatCurrency } from "@/lib/utils"

const purchaseOrderSchema = z.object({
  poType: z.enum(["vendor", "customer"]),
  vendorId: z.string().optional(),
  customerId: z.string().optional(),
  quotationId: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  expectedDelivery: z.string().min(1, "Expected delivery date is required"),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required"),
      quantity: z.number().min(0.01, "Quantity must be greater than 0"),
      unitPrice: z.number().min(0, "Unit price must be 0 or greater"),
      discount: z.number().min(0).max(100),
      tax: z.number().min(0).max(100),
    })
  ).min(1, "At least one item is required"),
  taxRate: z.number().min(0).max(100),
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
  const [poType, setPoType] = useState<"vendor" | "customer">(order?.customerId ? "customer" : "vendor")
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null)
  const [subtotal, setSubtotal] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [total, setTotal] = useState(0)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: order || {
      poType: order?.customerId ? "customer" : "vendor",
      vendorId: "",
      customerId: order?.customerId || "",
      quotationId: order?.quotationId || "",
      date: new Date().toISOString().split("T")[0],
      expectedDelivery: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      items: [{ description: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0 }],
      taxRate: order?.taxRate || 0,
      terms: "",
      notes: "",
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  })

  useEffect(() => {
    setVendors(vendorService.getAll())
    setCustomers(customerService.getAll())
    // Show all quotations (draft, sent, accepted) - not just accepted
    // Filter out only rejected and expired
    setQuotations(quotationService.getAll().filter(q => 
      q.status !== 'rejected' && q.status !== 'expired'
    ))
    
    // If order has quotationId, load it and set selected quotation
    if (order?.quotationId) {
      const q = quotationService.getById(order.quotationId)
      if (q) {
        setSelectedQuotation(q)
        // Load quotation items into form
        const quotationItems = q.items.map(item => {
          let quantity = item.quantity
          if (q.billingType === 'hours' && item.hours) {
            quantity = item.hours
          } else if (q.billingType === 'days' && item.days) {
            quantity = item.days
          }
          return {
            description: item.description,
            quantity: quantity,
            unitPrice: item.unitPrice,
            discount: item.discount || 0,
            tax: item.tax || 0,
          }
        })
        if (quotationItems.length > 0) {
          replace(quotationItems)
        }
      }
    }
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
    const quotation = quotationService.getById(quotationId)
    if (quotation) {
      setSelectedQuotation(quotation)
      setValue("customerId", quotation.customerId)
      setValue("taxRate", quotation.taxRate)
      
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
          discount: item.discount || 0,
          tax: item.tax || 0,
        }
      })
      replace(quotationItems.length > 0 ? quotationItems : [{ description: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0 }])
    }
  }

  const watchedItems = watch("items")
  const watchedTaxRate = watch("taxRate")

  useEffect(() => {
    let sub = 0
    watchedItems.forEach((item) => {
      const itemTotal = item.quantity * item.unitPrice
      const discountAmount = (itemTotal * item.discount) / 100
      const afterDiscount = itemTotal - discountAmount
      sub += afterDiscount
    })
    setSubtotal(sub)
    const tax = (sub * watchedTaxRate) / 100
    setTaxAmount(tax)
    setTotal(sub + tax)
  }, [watchedItems, watchedTaxRate])

  const addItem = () => {
    append({ description: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0 })
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

    const items: PurchaseOrderItem[] = data.items.map((item, index) => {
      const itemTotal = item.quantity * item.unitPrice
      const discountAmount = (itemTotal * item.discount) / 100
      const afterDiscount = itemTotal - discountAmount
      const itemTax = (afterDiscount * item.tax) / 100
      return {
        id: `item-${index}`,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discount: item.discount,
        tax: item.tax,
        total: afterDiscount + itemTax,
      }
    })

    const orderData: any = {
      orderNumber: order?.orderNumber || `PO-${Date.now()}`,
      date: data.date,
      expectedDelivery: data.expectedDelivery,
      items,
      subtotal,
      taxRate: data.taxRate,
      taxAmount,
      discount: 0,
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
          <Label htmlFor="poType">PO Type *</Label>
          <Select
            value={poType}
            onValueChange={(value: "vendor" | "customer") => handlePoTypeChange(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select PO type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vendor">Vendor PO (من مورد)</SelectItem>
              <SelectItem value="customer">Customer PO (من عميل)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {poType === "vendor" ? (
          <div className="space-y-2">
            <Label htmlFor="vendorId">Vendor *</Label>
            <Select
              value={watch("vendorId") || ""}
              onValueChange={(value) => setValue("vendorId", value)}
            >
              <SelectTrigger>
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
                <SelectTrigger>
                  <SelectValue placeholder="Select quotation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {quotations.map((quotation) => {
                    const customer = customerService.getById(quotation.customerId)
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
              <Label htmlFor="customerId">Customer *</Label>
              <Select
                value={watch("customerId") || ""}
                onValueChange={(value) => setValue("customerId", value)}
                disabled={!!selectedQuotation}
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
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="date">Date *</Label>
          <Input type="date" {...register("date")} />
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedDelivery">Expected Delivery *</Label>
          <Input type="date" {...register("expectedDelivery")} />
          {errors.expectedDelivery && (
            <p className="text-sm text-destructive">{errors.expectedDelivery.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxRate">Tax Rate (%)</Label>
          <Input
            type="number"
            step="0.01"
            {...register("taxRate", { valueAsNumber: true })}
          />
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
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Discount %</TableHead>
                <TableHead>Tax %</TableHead>
                <TableHead>Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const item = watchedItems[index]
                const itemTotal = item.quantity * item.unitPrice
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
                        {...register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.unitPrice`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.discount`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.tax`, {
                          valueAsNumber: true,
                        })}
                      />
                    </TableCell>
                    <TableCell>{formatCurrency(itemFinalTotal)}</TableCell>
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
