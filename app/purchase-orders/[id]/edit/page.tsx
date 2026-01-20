"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PurchaseOrderForm } from "@/components/purchase-orders/PurchaseOrderForm"
import { purchaseOrderService } from "@/lib/data"
import { PurchaseOrder } from "@/types"

export default function EditPurchaseOrderPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<PurchaseOrder | null>(null)

  useEffect(() => {
    const id = params.id as string
    const po = purchaseOrderService.getById(id)
    setOrder(po || null)
  }, [params.id])

  const handleSubmit = (data: any) => {
    if (order) {
      purchaseOrderService.update(order.id, data)
      router.push(`/purchase-orders/${order.id}`)
    }
  }

  const handleCancel = () => {
    if (order) {
      router.push(`/purchase-orders/${order.id}`)
    } else {
      router.push("/purchase-orders")
    }
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Purchase Order</h1>
        <p className="text-muted-foreground">Edit purchase order {order.orderNumber}</p>
      </div>
      <PurchaseOrderForm order={order} onSubmit={handleSubmit} onCancel={handleCancel} />
    </div>
  )
}
