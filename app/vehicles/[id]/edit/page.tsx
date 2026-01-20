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
import { vehicleService } from "@/lib/data"
import { Vehicle } from "@/types"

const vehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  licensePlate: z.string().min(1, "License plate is required"),
  vin: z.string().min(1, "VIN is required"),
  color: z.string().min(1, "Color is required"),
  mileage: z.number().min(0),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  purchasePrice: z.number().min(0),
  status: z.enum(["active", "maintenance", "retired"]),
  notes: z.string().optional(),
})

type VehicleFormData = z.infer<typeof vehicleSchema>

export default function EditVehiclePage() {
  const params = useParams()
  const router = useRouter()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  })

  useEffect(() => {
    const id = params.id as string
    const v = vehicleService.getById(id)
    if (v) {
      setVehicle(v)
      reset({
        ...v,
        purchaseDate: v.purchaseDate.split("T")[0],
      })
    }
  }, [params.id, reset])

  const onSubmit = (data: VehicleFormData) => {
    if (vehicle) {
      vehicleService.update(vehicle.id, data)
      router.push(`/vehicles/${vehicle.id}`)
    }
  }

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Vehicle</h1>
        <p className="text-muted-foreground">Edit vehicle information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="make">Make *</Label>
            <Input id="make" {...register("make")} />
            {errors.make && (
              <p className="text-sm text-destructive">{errors.make.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="model">Model *</Label>
            <Input id="model" {...register("model")} />
            {errors.model && (
              <p className="text-sm text-destructive">{errors.model.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              type="number"
              {...register("year", { valueAsNumber: true })}
            />
            {errors.year && (
              <p className="text-sm text-destructive">{errors.year.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licensePlate">License Plate *</Label>
            <Input id="licensePlate" {...register("licensePlate")} />
            {errors.licensePlate && (
              <p className="text-sm text-destructive">{errors.licensePlate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="vin">VIN *</Label>
            <Input id="vin" {...register("vin")} />
            {errors.vin && (
              <p className="text-sm text-destructive">{errors.vin.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color *</Label>
            <Input id="color" {...register("color")} />
            {errors.color && (
              <p className="text-sm text-destructive">{errors.color.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="mileage">Mileage *</Label>
            <Input
              id="mileage"
              type="number"
              {...register("mileage", { valueAsNumber: true })}
            />
            {errors.mileage && (
              <p className="text-sm text-destructive">{errors.mileage.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchaseDate">Purchase Date *</Label>
            <Input id="purchaseDate" type="date" {...register("purchaseDate")} />
            {errors.purchaseDate && (
              <p className="text-sm text-destructive">{errors.purchaseDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="purchasePrice">Purchase Price *</Label>
            <Input
              id="purchasePrice"
              type="number"
              step="0.01"
              {...register("purchasePrice", { valueAsNumber: true })}
            />
            {errors.purchasePrice && (
              <p className="text-sm text-destructive">{errors.purchasePrice.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register("notes")} rows={4} />
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
            Update Vehicle
          </Button>
        </div>
      </form>
    </div>
  )
}
