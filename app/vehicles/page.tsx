"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, Eye, Truck } from "lucide-react"
import { vehicleService } from "@/lib/data"
import { Vehicle } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()

  useEffect(() => {
    setVehicles(vehicleService.getAll())
  }, [])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      vehicleService.delete(id)
      setVehicles(vehicleService.getAll())
    }
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

  const filteredVehicles = vehicles.filter((v) =>
    v.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.vin.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Vehicles"
        description="Manage your vehicle fleet"
        actionLabel={canEdit('vehicles') ? "New Vehicle" : undefined}
        actionHref={canEdit('vehicles') ? "/vehicles/new" : undefined}
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search vehicles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 text-base"
        />
      </div>

      <Card className="border-2 border-blue-200/60 shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100/50 border-b-2 border-blue-200">
              <TableHead className="font-bold text-blue-900">Make</TableHead>
              <TableHead className="font-bold text-blue-900">Model</TableHead>
              <TableHead className="font-bold text-blue-900">Year</TableHead>
              <TableHead className="font-bold text-blue-900">License Plate</TableHead>
              <TableHead className="font-bold text-blue-900">VIN</TableHead>
              <TableHead className="font-bold text-blue-900">Mileage</TableHead>
              <TableHead className="font-bold text-blue-900">Status</TableHead>
              <TableHead className="text-right font-bold text-blue-900">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <Truck className="h-12 w-12 text-gray-300" />
                    <p className="text-gray-500 font-medium text-lg">No vehicles found</p>
                    <p className="text-gray-400 text-sm">Add your first vehicle to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="hover:bg-blue-50/50 transition-colors border-b border-blue-100">
                  <TableCell className="font-semibold text-blue-900">{vehicle.make}</TableCell>
                  <TableCell className="text-gray-700">{vehicle.model}</TableCell>
                  <TableCell className="text-gray-600">{vehicle.year}</TableCell>
                  <TableCell className="text-gray-700 font-medium">{vehicle.licensePlate}</TableCell>
                  <TableCell className="text-gray-600 font-mono text-sm">{vehicle.vin}</TableCell>
                  <TableCell className="text-gray-600">{vehicle.mileage.toLocaleString()} miles</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(vehicle.status)} className="font-semibold">
                      {vehicle.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/vehicles/${vehicle.id}`)}
                        className="hover:bg-blue-100 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit('vehicles') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/vehicles/${vehicle.id}/edit`)}
                          className="hover:bg-blue-100 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete('vehicles') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(vehicle.id)}
                          className="hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
