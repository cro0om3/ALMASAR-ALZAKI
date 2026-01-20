"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { projectService } from "@/lib/data/project-service"
import { vehicleService } from "@/lib/data"
import { Project } from "@/types/project"
import { Truck } from "lucide-react"

export default function AssignVehiclesPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [allVehicles, setAllVehicles] = useState<any[]>([])
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([])

  useEffect(() => {
    const id = params.id as string
    const p = projectService.getById(id)
    if (p) {
      setProject(p)
      setSelectedVehicles(p.assignedVehicles || [])
    }
    
    // Get all active vehicles
    const vehicles = vehicleService.getAll().filter(v => v.status === 'active')
    setAllVehicles(vehicles)
  }, [params.id])

  const handleToggleVehicle = (vehicleId: string) => {
    setSelectedVehicles(prev => {
      if (prev.includes(vehicleId)) {
        return prev.filter(id => id !== vehicleId)
      } else {
        return [...prev, vehicleId]
      }
    })
  }

  const handleSave = () => {
    if (!project) return
    
    projectService.assignVehicles(project.id, selectedVehicles)
    router.push(`/projects/${project.id}`)
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-8 md:p-10 rounded-2xl shadow-luxury">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">Assign Vehicles</h1>
          <p className="text-blue-100 text-lg font-medium">Project: {project.title}</p>
        </div>
      </div>

      <Card className="border-2 border-blue-200/60">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
            <CardTitle className="text-xl font-bold text-blue-900">Select Vehicles for Project</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {allVehicles.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No vehicles available</p>
          ) : (
            <div className="space-y-3">
              {allVehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex items-center gap-4 p-4 border-2 border-blue-200/60 rounded-lg hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => handleToggleVehicle(vehicle.id)}
                >
                  <Checkbox
                    checked={selectedVehicles.includes(vehicle.id)}
                    onCheckedChange={() => handleToggleVehicle(vehicle.id)}
                  />
                  <Truck className="h-5 w-5 text-gold" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">
                      {vehicle.make} {vehicle.model} ({vehicle.year})
                    </p>
                    <p className="text-sm text-gray-600">
                      Plate: {vehicle.licensePlate} | VIN: {vehicle.vin}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-gold text-gold hover:bg-gold hover:text-white"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="gold"
          className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-8 py-3"
        >
          Save Vehicles
        </Button>
      </div>
    </div>
  )
}
