"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { projectService } from "@/lib/data/project-service"
import { ProjectStatus } from "@/types/project"
import { quotationService, customerService } from "@/lib/data"
import { BillingType } from "@/types/project"

const projectSchema = z.object({
  quotationId: z.string().min(1, "Quotation is required"),
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  billingType: z.enum(["hours", "days", "fixed"]),
  hourlyRate: z.number().optional(),
  dailyRate: z.number().optional(),
  fixedAmount: z.number().optional(),
  poNumber: z.string().optional(),
  poDate: z.string().optional(),
  terms: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => {
  if (data.billingType === "hours" && !data.hourlyRate) {
    return false
  }
  if (data.billingType === "days" && !data.dailyRate) {
    return false
  }
  if (data.billingType === "fixed" && !data.fixedAmount) {
    return false
  }
  return true
}, {
  message: "Please enter the price according to billing type",
  path: ["billingType"],
})

type ProjectFormData = z.infer<typeof projectSchema>

export default function NewProjectPage() {
  const router = useRouter()
  const [quotations, setQuotations] = useState<any[]>([])
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      startDate: new Date().toISOString().split("T")[0],
      billingType: "hours",
    },
  })

  const billingType = watch("billingType")

  useEffect(() => {
    const allQuotations = quotationService.getAll()
    const acceptedQuotations = allQuotations.filter(q => q.status === 'accepted')
    setQuotations(acceptedQuotations)
  }, [])

  const handleQuotationChange = (quotationId: string) => {
    setValue("quotationId", quotationId)
    const quotation = quotationService.getById(quotationId)
    if (quotation) {
      setSelectedQuotation(quotation)
      const customer = customerService.getById(quotation.customerId)
      
      // Auto-set billing type from quotation
      if (quotation.billingType) {
        if (quotation.billingType === 'hours' || quotation.billingType === 'days') {
          setValue("billingType", quotation.billingType as BillingType)
        } else {
          setValue("billingType", "fixed")
        }
        
        // Auto-set rates from quotation items if available
        if (quotation.items && quotation.items.length > 0) {
          const firstItem = quotation.items[0]
          if (quotation.billingType === 'hours' && firstItem.unitPrice) {
            setValue("hourlyRate", firstItem.unitPrice)
          } else if (quotation.billingType === 'days' && firstItem.unitPrice) {
            setValue("dailyRate", firstItem.unitPrice)
          }
        }
      }
    }
  }

  const onSubmit = (data: ProjectFormData) => {
    const quotation = quotationService.getById(data.quotationId)
    if (!quotation) return

    const projectData = {
      projectNumber: `PRJ-${Date.now()}`,
      quotationId: data.quotationId,
      customerId: quotation.customerId,
      title: data.title,
      description: data.description || "",
      startDate: data.startDate,
      billingType: data.billingType as BillingType,
      hourlyRate: data.hourlyRate,
      dailyRate: data.dailyRate,
      fixedAmount: data.fixedAmount,
      poNumber: data.poNumber,
      poDate: data.poDate,
      poReceived: !!data.poNumber,
      assignedVehicles: [],
      status: data.poNumber ? 'po_received' : 'quotation_sent',
      terms: data.terms || "",
      notes: data.notes || "",
    }

    projectService.create({
      ...projectData,
      status: projectData.status as ProjectStatus
    })
    router.push("/projects")
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-8 md:p-10 rounded-2xl shadow-luxury">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">New Project</h1>
          <p className="text-blue-100 text-lg font-medium">Create a new project from an accepted quotation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-2 border-blue-200/60 p-6">
          <h2 className="text-xl font-semibold text-blue-900 mb-6 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded"></span>
            Project Information
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quotationId" className="text-blue-900 font-medium">Quotation *</Label>
              <Select
                value={watch("quotationId") || ""}
                onValueChange={handleQuotationChange}
              >
                <SelectTrigger className="h-12 border-2 border-blue-200/60">
                  <SelectValue placeholder="Select accepted quotation" />
                </SelectTrigger>
                <SelectContent>
                  {quotations.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.quotationNumber} - {q.customer?.name || "Customer"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.quotationId && (
                <p className="text-sm text-red-600">{errors.quotationId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-blue-900 font-medium">Project Title *</Label>
              <Input id="title" {...register("title")} className="h-12" />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-blue-900 font-medium">Start Date *</Label>
              <Input type="date" id="startDate" {...register("startDate")} className="h-12" />
              {errors.startDate && (
                <p className="text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingType" className="text-blue-900 font-medium">Billing Type *</Label>
              <Select
                value={billingType}
                onValueChange={(value) => setValue("billingType", value as BillingType)}
              >
                <SelectTrigger className="h-12 border-2 border-blue-200/60">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">By Hours</SelectItem>
                  <SelectItem value="days">By Days</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {billingType === "hours" && (
              <div className="space-y-2">
                <Label htmlFor="hourlyRate" className="text-blue-900 font-medium">Hourly Rate *</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="hourlyRate"
                  {...register("hourlyRate", { valueAsNumber: true })}
                  className="h-12"
                />
                {errors.hourlyRate && (
                  <p className="text-sm text-red-600">{errors.hourlyRate.message}</p>
                )}
              </div>
            )}

            {billingType === "days" && (
              <div className="space-y-2">
                <Label htmlFor="dailyRate" className="text-blue-900 font-medium">Daily Rate *</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="dailyRate"
                  {...register("dailyRate", { valueAsNumber: true })}
                  className="h-12"
                />
                {errors.dailyRate && (
                  <p className="text-sm text-red-600">{errors.dailyRate.message}</p>
                )}
              </div>
            )}

            {billingType === "fixed" && (
              <div className="space-y-2">
                <Label htmlFor="fixedAmount" className="text-blue-900 font-medium">Fixed Amount *</Label>
                <Input
                  type="number"
                  step="0.01"
                  id="fixedAmount"
                  {...register("fixedAmount", { valueAsNumber: true })}
                  className="h-12"
                />
                {errors.fixedAmount && (
                  <p className="text-sm text-red-600">{errors.fixedAmount.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="poNumber" className="text-blue-900 font-medium">Purchase Order (PO) Number</Label>
              <Input id="poNumber" {...register("poNumber")} className="h-12" />
            </div>

            {watch("poNumber") && (
              <div className="space-y-2">
                <Label htmlFor="poDate" className="text-blue-900 font-medium">PO Date</Label>
                <Input type="date" id="poDate" {...register("poDate")} className="h-12" />
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <Label htmlFor="description" className="text-blue-900 font-medium">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={4}
              className="border-2 border-blue-200/60"
            />
          </div>
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
            Create Project
          </Button>
        </div>
      </form>
    </div>
  )
}
