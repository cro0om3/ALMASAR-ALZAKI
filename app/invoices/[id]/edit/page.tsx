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
import { Plus, Trash2 } from "lucide-react"
import { invoiceService, customerService } from "@/lib/data"
import { Invoice, InvoiceItem } from "@/types"
import { formatCurrency } from "@/lib/utils"

const invoiceSchema = z.object({
  customerId: z.string().min(1, "Customer is required"),
  date: z.string().min(1, "Date is required"),
  dueDate: z.string().min(1, "Due date is required"),
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
  paidAmount: z.number().min(0),
  status: z.enum(["draft", "sent", "paid", "overdue", "cancelled"]),
  terms: z.string().optional(),
  notes: z.string().optional(),
})

type InvoiceFormData = z.infer<typeof invoiceSchema>

export default function EditInvoicePage() {
  const params = useParams()
  const router = useRouter()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [subtotal, setSubtotal] = useState(0)
  const [taxAmount, setTaxAmount] = useState(0)
  const [total, setTotal] = useState(0)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      items: [],
      taxRate: 5,
      paidAmount: 0,
      status: "draft",
    },
  })

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  })

  useEffect(() => {
    setCustomers(customerService.getAll())
    
    const id = params.id as string
    const inv = invoiceService.getById(id)
    if (inv) {
      setInvoice(inv)
      reset({
        customerId: inv.customerId,
        date: inv.date.split("T")[0],
        dueDate: inv.dueDate.split("T")[0],
        items: inv.items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          tax: item.tax,
        })),
        taxRate: inv.taxRate,
        paidAmount: inv.paidAmount,
        status: inv.status,
        terms: inv.terms,
        notes: inv.notes,
      })
    }
  }, [params.id, reset])

  const watchedItems = watch("items")
  const watchedTaxRate = watch("taxRate")

  useEffect(() => {
    if (!watchedItems || !Array.isArray(watchedItems)) {
      return
    }
    
    let sub = 0
    watchedItems.forEach((item) => {
      if (!item) return
      const itemTotal = (item.quantity || 0) * (item.unitPrice || 0)
      const discountAmount = (itemTotal * (item.discount || 0)) / 100
      const afterDiscount = itemTotal - discountAmount
      sub += afterDiscount
    })
    setSubtotal(sub)
    const tax = (sub * (watchedTaxRate || 0)) / 100
    setTaxAmount(tax)
    setTotal(sub + tax)
  }, [watchedItems, watchedTaxRate])

  const addItem = () => {
    append({ description: "", quantity: 1, unitPrice: 0, discount: 0, tax: 0 })
  }

  const onSubmit = (data: InvoiceFormData) => {
    if (invoice) {
      const items: InvoiceItem[] = data.items.map((item, index) => {
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

      invoiceService.update(invoice.id, {
        customerId: data.customerId,
        date: data.date,
        dueDate: data.dueDate,
        items,
        subtotal,
        taxRate: data.taxRate,
        taxAmount,
        total,
        paidAmount: data.paidAmount,
        status: data.status,
        terms: data.terms || "",
        notes: data.notes || "",
      })
      router.push(`/invoices/${invoice.id}`)
    }
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Invoice</h1>
        <p className="text-muted-foreground">Edit invoice {invoice.invoiceNumber}</p>
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidAmount">Paid Amount</Label>
            <Input
              type="number"
              step="0.01"
              {...register("paidAmount", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
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
                  const item = watchedItems?.[index]
                  if (!item) return null
                  
                  const itemTotal = (item.quantity || 0) * (item.unitPrice || 0)
                  const discountAmount = (itemTotal * (item.discount || 0)) / 100
                  const afterDiscount = itemTotal - discountAmount
                  const itemTax = (afterDiscount * (item.tax || 0)) / 100
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
            <span>VAT ({watchedTaxRate}%):</span>
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
            Update Invoice
          </Button>
        </div>
      </form>
    </div>
  )
}
