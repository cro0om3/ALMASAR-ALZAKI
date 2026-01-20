"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { employeeService } from "@/lib/data"
import { Employee } from "@/types"

const employeeSchema = z.object({
  employeeNumber: z.string().min(1, "Employee number is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  country: z.string().min(1, "Country is required"),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  hireDate: z.string().min(1, "Hire date is required"),
  salary: z.number().min(0),
  status: z.enum(["active", "inactive", "terminated"]),
  // Identity and residence fields (optional)
  idNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  residenceIssueDate: z.string().optional(),
  residenceExpiryDate: z.string().optional(),
  nationality: z.string().optional(),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

export default function EditEmployeePage() {
  const params = useParams()
  const router = useRouter()
  const [employee, setEmployee] = useState<Employee | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  })

  useEffect(() => {
    const id = params.id as string
    const e = employeeService.getById(id)
    if (e) {
      setEmployee(e)
      reset({
        ...e,
        hireDate: e.hireDate.split("T")[0],
      })
    }
  }, [params.id, reset])

  const onSubmit = (data: EmployeeFormData) => {
    if (employee) {
      employeeService.update(employee.id, data)
      router.push(`/employees/${employee.id}`)
    }
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Employee</h1>
        <p className="text-muted-foreground">Edit employee information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="employeeNumber">Employee Number *</Label>
            <Input id="employeeNumber" {...register("employeeNumber")} />
            {errors.employeeNumber && (
              <p className="text-sm text-destructive">{errors.employeeNumber.message}</p>
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
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input id="firstName" {...register("firstName")} />
            {errors.firstName && (
              <p className="text-sm text-destructive">{errors.firstName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input id="lastName" {...register("lastName")} />
            {errors.lastName && (
              <p className="text-sm text-destructive">{errors.lastName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position *</Label>
            <Input id="position" {...register("position")} />
            {errors.position && (
              <p className="text-sm text-destructive">{errors.position.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department *</Label>
            <Input id="department" {...register("department")} />
            {errors.department && (
              <p className="text-sm text-destructive">{errors.department.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="hireDate">Hire Date *</Label>
            <Input id="hireDate" type="date" {...register("hireDate")} />
            {errors.hireDate && (
              <p className="text-sm text-destructive">{errors.hireDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary *</Label>
            <Input
              id="salary"
              type="number"
              step="0.01"
              {...register("salary", { valueAsNumber: true })}
            />
            {errors.salary && (
              <p className="text-sm text-destructive">{errors.salary.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input id="address" {...register("address")} />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input id="city" {...register("city")} />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input id="state" {...register("state")} />
            {errors.state && (
              <p className="text-sm text-destructive">{errors.state.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip Code *</Label>
            <Input id="zipCode" {...register("zipCode")} />
            {errors.zipCode && (
              <p className="text-sm text-destructive">{errors.zipCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input id="country" {...register("country")} />
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country.message}</p>
            )}
          </div>
        </div>

        <div className="border-2 border-blue-200/60 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded"></span>
            Identity & Residence Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input 
                id="idNumber" 
                {...register("idNumber")} 
                placeholder="رقم الهوية"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passportNumber">Passport Number</Label>
              <Input 
                id="passportNumber" 
                {...register("passportNumber")} 
                placeholder="رقم الجواز"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input 
                id="nationality" 
                {...register("nationality")} 
                placeholder="الجنسية"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="residenceIssueDate">Residence Issue Date</Label>
              <Input 
                id="residenceIssueDate" 
                type="date"
                {...register("residenceIssueDate")} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="residenceExpiryDate">Residence Expiry Date</Label>
              <Input 
                id="residenceExpiryDate" 
                type="date"
                {...register("residenceExpiryDate")} 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="gold"
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-8 py-3"
          >
            Update Employee
          </Button>
        </div>
      </form>
    </div>
  )
}
