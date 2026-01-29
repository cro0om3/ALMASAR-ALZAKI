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
import { Payslip } from "@/types"
import { formatCurrency } from "@/lib/utils"

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

export default function EditPayslipPage() {
  const params = useParams()
  const router = useRouter()
  const [payslip, setPayslip] = useState<Payslip | null>(null)
  const [employees, setEmployees] = useState<any[]>([])
  const [netPay, setNetPay] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PayslipFormData>({
    resolver: zodResolver(payslipSchema),
  })

  useEffect(() => {
    const id = params.id as string
    if (!id) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    const load = async () => {
      try {
        const [pRes, employeesRes] = await Promise.all([
          fetch(`/api/payslips/${id}`),
          fetch('/api/employees'),
        ])
        if (cancelled) return
        const p = pRes.ok ? await pRes.json() : null
        const employeesList = employeesRes.ok ? await employeesRes.json() : []
        setEmployees(employeesList || [])
        if (p) {
          setPayslip(p)
          const dateStr = (d: string) => (d && d.includes('T') ? d.split('T')[0] : d)
          reset({
            employeeId: p.employeeId,
            payPeriodStart: dateStr(p.payPeriodStart),
            payPeriodEnd: dateStr(p.payPeriodEnd),
            issueDate: dateStr(p.issueDate),
            baseSalary: p.baseSalary,
            overtime: p.overtime,
            bonuses: p.bonuses,
            deductions: p.deductions,
            tax: p.tax,
            status: p.status,
            notes: p.notes,
          })
        } else setPayslip(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [params.id, reset])

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
    if (!payslip) return
    setSaving(true)
    try {
      const res = await fetch(`/api/payslips/${payslip.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, netPay }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update payslip')
      }
      router.push(`/payslips/${payslip.id}`)
    } catch (e: any) {
      console.error(e)
      alert(e?.message || 'Failed to update payslip')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }
  if (!payslip) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Payslip not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Payslip</h1>
        <p className="text-muted-foreground">Edit payslip {payslip.payslipNumber}</p>
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
            disabled={saving}
            variant="gold"
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-8 py-3"
          >
            {saving ? "Saving..." : "Update Payslip"}
          </Button>
        </div>
      </form>
    </div>
  )
}
