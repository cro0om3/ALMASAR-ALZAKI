"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { PurchaseOrderForm } from "@/components/purchase-orders/PurchaseOrderForm"
import { purchaseOrderService, quotationService } from "@/lib/data"
import { useEffect, useState, Suspense } from "react"

function NewPurchaseOrderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromQuotation = searchParams.get("fromQuotation")
  const [initialOrder, setInitialOrder] = useState<any>(null)

  useEffect(() => {
    if (fromQuotation) {
      const quotation = quotationService.getById(fromQuotation)
      if (quotation) {
        setInitialOrder({
          poType: "customer",
          customerId: quotation.customerId,
          quotationId: quotation.id,
          taxRate: quotation.taxRate,
        })
      }
    }
  }, [fromQuotation])

  const handleSubmit = (data: any) => {
    purchaseOrderService.create(data)
    router.push("/purchase-orders")
  }

  const handleCancel = () => {
    router.push("/purchase-orders")
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-8 md:p-10 rounded-2xl shadow-luxury">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">New Purchase Order</h1>
          <p className="text-blue-100 text-lg font-medium">
            {fromQuotation ? "Create Purchase Order from Quotation" : "Create a new purchase order"}
          </p>
        </div>
      </div>
      <PurchaseOrderForm order={initialOrder} onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}

export default function NewPurchaseOrderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <NewPurchaseOrderContent />
    </Suspense>
  )
}
