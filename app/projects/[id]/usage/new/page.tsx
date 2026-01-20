"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
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
import { Card } from "@/components/ui/card"
import { projectService, usageService } from "@/lib/data/project-service"
import { vehicleService } from "@/lib/data"
import { Project } from "@/types/project"
import { formatCurrency } from "@/lib/utils"

const usageSchema = z.object({
  vehicleId: z.string().min(1, "Vehicle is required"),
  date: z.string().min(1, "Date is required"),
  hours: z.number().optional(),
  days: z.number().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  location: z.string().optional(),
}).refine((data) => {
  // Must enter either hours or days
  return data.hours !== undefined || data.days !== undefined
}, {
  message: "Please enter either hours or days",
  path: ["hours"],
})

type UsageFormData = z.infer<typeof usageSchema>

export default function NewUsagePage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<Project | null>(null)
  const [vehicles, setVehicles] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UsageFormData>({
    resolver: zodResolver(usageSchema),
    defaultValues: {
      date: new Date().toISOString().split("T")[0],
    },
  })

  useEffect(() => {
    const id = params.id as string
    const p = projectService.getById(id)
    if (p) {
      setProject(p)
      // Get assigned vehicles for the project
      const assignedVehicles = p.assignedVehicles.map(vId => vehicleService.getById(vId)).filter(Boolean)
      setVehicles(assignedVehicles)
    }
  }, [params.id])

  const onSubmit = (data: UsageFormData) => {
    if (!project) return

    const usageData = {
      projectId: project.id,
      vehicleId: data.vehicleId,
      date: data.date,
      hours: project.billingType === 'hours' ? data.hours : undefined,
      days: project.billingType === 'days' ? data.days : undefined,
      startTime: data.startTime,
      endTime: data.endTime,
      description: data.description,
      location: data.location,
      rate: project.billingType === 'hours' 
        ? (project.hourlyRate || 0)
        : project.billingType === 'days'
        ? (project.dailyRate || 0)
        : 0,
    }

    usageService.create(usageData)
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
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">Add Usage</h1>
          <p className="text-blue-100 text-lg font-medium">Project: {project.title}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-2 border-blue-200/60 p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded"></span>
            Usage Details
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vehicleId" className="text-blue-900 font-medium">Vehicle *</Label>
              <Select
                value={watch("vehicleId") || ""}
                onValueChange={(value) => setValue("vehicleId", value)}
              >
                <SelectTrigger className="h-12 border-2 border-blue-200/60">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleId && (
                <p className="text-sm text-red-600">{errors.vehicleId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-blue-900 font-medium">Date *</Label>
              <Input type="date" id="date" {...register("date")} className="h-12" />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>

            {project.billingType === 'hours' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="hours" className="text-blue-900 font-medium">Hours *</Label>
                  <Input
                    type="number"
                    step="0.5"
                    id="hours"
                    {...register("hours", { valueAsNumber: true })}
                    className="h-12"
                    placeholder="e.g., 8.5"
                  />
                  {errors.hours && (
                    <p className="text-sm text-red-600">{errors.hours.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-blue-900 font-medium">Start Time</Label>
                  <Input type="time" id="startTime" {...register("startTime")} className="h-12" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-blue-900 font-medium">End Time</Label>
                  <Input type="time" id="endTime" {...register("endTime")} className="h-12" />
                </div>
              </>
            )}

            {project.billingType === 'days' && (
              <div className="space-y-2">
                <Label htmlFor="days" className="text-blue-900 font-medium">Days *</Label>
                <Input
                  type="number"
                  step="0.5"
                  id="days"
                  {...register("days", { valueAsNumber: true })}
                  className="h-12"
                  placeholder="e.g., 1 or 0.5"
                />
                {errors.days && (
                  <p className="text-sm text-red-600">{errors.days.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="location" className="text-blue-900 font-medium">Work Location</Label>
              <Input id="location" {...register("location")} className="h-12" />
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="description" className="text-blue-900 font-medium">Work Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={4}
              className="border-2 border-blue-200/60"
              placeholder="Describe the work performed..."
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          {project.billingType === 'hours' && project.hourlyRate && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Hourly Rate: <span className="font-semibold text-blue-900">{formatCurrency(project.hourlyRate)}</span>
              </p>
            </div>
          )}

          {project.billingType === 'days' && project.dailyRate && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Daily Rate: <span className="font-semibold text-blue-900">{formatCurrency(project.dailyRate)}</span>
              </p>
            </div>
          )}
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="border-gold text-gold hover:bg-gold hover:text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gold"
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-8 py-3"
          >
            Save Usage
          </Button>
        </div>
      </form>
    </div>
  )
}
