"use client"

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
import { formatCurrency } from "@/lib/utils"
import { useState, useEffect } from "react"

const payslipSchema = z.object({
  employeeId: z.string().optional(),
  payPeriodStart: z.string().optional(),
  payPeriodEnd: z.string().optional(),
  issueDate: z.string().optional(),
  baseSalary: z.number().min(0).optional(),
  overtime: z.number().min(0).optional(),
  bonuses: z.number().min(0).optional(),
  deductions: z.number().min(0).optional(),
  tax: z.number().min(0).optional(),
  status: z.enum(["draft", "issued", "paid"]).optional(),
  notes: z.string().optional(),
})

type PayslipFormData = z.infer<typeof payslipSchema>

export default function NewPayslipPage() {
  const router = useRouter()
  const [employees, setEmployees] = useState<any[]>([])
  const [netPay, setNetPay] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PayslipFormData>({
    resolver: zodResolver(payslipSchema),
    defaultValues: {
      issueDate: new Date().toISOString().split("T")[0],
      status: "draft",
    },
  })

  useEffect(() => {
    fetch('/api/employees')
      .then((r) => r.ok ? r.json() : [])
      .then((list) => setEmployees(list || []))
  }, [])

  const watchedEmployeeId = watch("employeeId")

  useEffect(() => {
    if (watchedEmployeeId && employees.length > 0) {
      const employee = employees.find((e: any) => e.id === watchedEmployeeId)
      if (employee && employee.salary) {
        setValue("baseSalary", employee.salary)
      }
    }
  }, [watchedEmployeeId, setValue, employees])

  const watchedBaseSalary = watch("baseSalary") || 0
  const watchedOvertime = watch("overtime") || 0
  const watchedBonuses = watch("bonuses") || 0
  const watchedDeductions = watch("deductions") || 0
  const watchedTax = watch("tax") || 0

  useEffect(() => {
    const gross = watchedBaseSalary + watchedOvertime + watchedBonuses
    const net = gross - watchedDeductions - watchedTax
    setNetPay(net)
  }, [watchedBaseSalary, watchedOvertime, watchedBonuses, watchedDeductions, watchedTax])

  const onSubmit = async (data: PayslipFormData) => {
    try {
      const payslipData = {
        payslipNumber: `PAY-${Date.now()}`,
        employeeId: data.employeeId,
        payPeriodStart: data.payPeriodStart,
        payPeriodEnd: data.payPeriodEnd,
        issueDate: data.issueDate,
        baseSalary: data.baseSalary,
        overtime: data.overtime,
        bonuses: data.bonuses,
        deductions: data.deductions,
        tax: data.tax,
        netPay,
        status: data.status,
        notes: data.notes || "",
      }
      const res = await fetch('/api/payslips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payslipData),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to create payslip')
      }
      router.push("/payslips")
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Failed to create payslip')
    }
  }

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-8 md:p-10 rounded-2xl shadow-luxury">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">New Payslip</h1>
          <p className="text-blue-100 text-lg font-medium">Create a new payslip</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee</Label>
            <Select
              value={watch("employeeId")}
              onValueChange={(value) => setValue("employeeId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName} ({employee.employeeNumber})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employeeId && (
              <p className="text-sm text-destructive">{errors.employeeId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="issueDate">Issue Date</Label>
            <Input type="date" {...register("issueDate")} />
            {errors.issueDate && (
              <p className="text-sm text-destructive">{errors.issueDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payPeriodStart">Pay Period Start</Label>
            <Input type="date" {...register("payPeriodStart")} />
            {errors.payPeriodStart && (
              <p className="text-sm text-destructive">{errors.payPeriodStart.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payPeriodEnd">Pay Period End</Label>
            <Input type="date" {...register("payPeriodEnd")} />
            {errors.payPeriodEnd && (
              <p className="text-sm text-destructive">{errors.payPeriodEnd.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseSalary">Base Salary</Label>
            <Input
              type="number"
              step="0.01"
              {...register("baseSalary", { valueAsNumber: true })}
            />
            {errors.baseSalary && (
              <p className="text-sm text-destructive">{errors.baseSalary.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="overtime">Overtime</Label>
            <Input
              type="number"
              step="0.01"
              {...register("overtime", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bonuses">Bonuses</Label>
            <Input
              type="number"
              step="0.01"
              {...register("bonuses", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deductions">Deductions</Label>
            <Input
              type="number"
              step="0.01"
              {...register("deductions", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tax">Tax</Label>
            <Input
              type="number"
              step="0.01"
              {...register("tax", { valueAsNumber: true })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) => setValue("status", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="issued">Issued</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" {...register("notes")} rows={4} />
        </div>

        <div className="rounded-md border p-4">
          <div className="flex justify-between font-bold text-lg">
            <span>Net Pay:</span>
            <span>{formatCurrency(netPay)}</span>
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
            Create Payslip
          </Button>
        </div>
      </form>
    </div>
  )
}
