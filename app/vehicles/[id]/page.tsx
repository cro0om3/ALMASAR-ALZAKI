"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, ArrowLeft } from "lucide-react"
import { vehicleService } from "@/lib/data"
import { Vehicle } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function VehicleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canEdit } = usePermissions()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)

  useEffect(() => {
    const id = params.id as string
    const v = vehicleService.getById(id)
    setVehicle(v || null)
  }, [params.id])

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Vehicle not found</p>
      </div>
    )
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "maintenance":
        return "warning"
      case "retired":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>
            <p className="text-muted-foreground">Vehicle details</p>
          </div>
        </div>
        {canEdit('vehicles') && (
          <Button onClick={() => router.push(`/vehicles/${vehicle.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Vehicle Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Make:</strong> {vehicle.make}</p>
            <p><strong>Model:</strong> {vehicle.model}</p>
            <p><strong>Year:</strong> {vehicle.year}</p>
            <p><strong>Color:</strong> {vehicle.color}</p>
            <p><strong>License Plate:</strong> {vehicle.licensePlate}</p>
            <p><strong>VIN:</strong> {vehicle.vin}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Purchase & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Purchase Date:</strong> {formatDate(vehicle.purchaseDate)}</p>
            <p><strong>Purchase Price:</strong> {formatCurrency(vehicle.purchasePrice)}</p>
            <p><strong>Mileage:</strong> {vehicle.mileage.toLocaleString()} miles</p>
            <p><strong>Status:</strong>{" "}
              <Badge variant={getStatusBadgeVariant(vehicle.status)}>
                {vehicle.status}
              </Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      {vehicle.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{vehicle.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
