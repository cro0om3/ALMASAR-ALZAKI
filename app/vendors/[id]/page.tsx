"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft } from "lucide-react"
import { Vendor } from "@/types"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function VendorDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canEdit } = usePermissions()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadVendor = async () => {
      try {
        setLoading(true)
        const id = params.id as string
        const response = await fetch(`/api/vendors/${id}`)
        if (!response.ok) throw new Error('Failed to load vendor')
        const data = await response.json()
        setVendor(data)
      } catch (error: any) {
        console.error('Error loading vendor:', error)
        setVendor(null)
      } finally {
        setLoading(false)
      }
    }
    loadVendor()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Vendor not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{vendor.name}</h1>
            <p className="text-muted-foreground">Vendor details</p>
          </div>
        </div>
        {canEdit('vendors') && (
          <Button onClick={() => router.push(`/vendors/${vendor.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Email:</strong> {vendor.email}</p>
            <p><strong>Phone:</strong> {vendor.phone}</p>
            <p><strong>Contact Person:</strong> {vendor.contactPerson}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>{vendor.address}</p>
            <p>{vendor.city}, {vendor.state} {vendor.zipCode}</p>
            <p>{vendor.country}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
