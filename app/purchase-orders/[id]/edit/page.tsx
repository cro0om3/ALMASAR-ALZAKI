"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { PurchaseOrderForm } from "@/components/purchase-orders/PurchaseOrderForm"
import { PurchaseOrder } from "@/types"

export default function EditPurchaseOrderPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const id = params.id as string
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    fetch(`/api/purchase-orders/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((po) => {
        if (!cancelled) setOrder(po || null)
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [params.id])

  const handleSubmit = async (data: any) => {
    if (!order) return
    setSaving(true)
    try {
      const res = await fetch(`/api/purchase-orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update purchase order')
      }
      router.push(`/purchase-orders/${order.id}`)
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Failed to update purchase order')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (order) router.push(`/purchase-orders/${order.id}`)
    else router.push("/purchase-orders")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }
  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Purchase order not found</p>
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
