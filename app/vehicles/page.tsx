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
import { Vehicle } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/vehicles')
      if (!res.ok) throw new Error('Failed to load vehicles')
      const data = await res.json()
      setVehicles(data)
    } catch (e) {
      console.error(e)
      setVehicles([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadVehicles()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      await loadVehicles()
    } catch (e) {
      console.error(e)
      alert('Failed to delete vehicle.')
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

      <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-b-0">
              <TableHead className="font-bold text-white">Make</TableHead>
              <TableHead className="font-bold text-white">Model</TableHead>
              <TableHead className="font-bold text-white">Year</TableHead>
              <TableHead className="font-bold text-white">License Plate</TableHead>
              <TableHead className="font-bold text-white">VIN</TableHead>
              <TableHead className="font-bold text-white">Mileage</TableHead>
              <TableHead className="font-bold text-white">Status</TableHead>
              <TableHead className="text-right font-bold text-white">Actions</TableHead>
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
        )}
      </Card>
    </div>
  )
}
