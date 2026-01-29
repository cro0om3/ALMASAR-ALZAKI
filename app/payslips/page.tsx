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
import { Plus, Search, Eye, Edit, Trash2, CreditCard, Calendar } from "lucide-react"
import { Payslip } from "@/types"
import type { Employee } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<(Payslip & { employee?: Employee })[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [generateMonth, setGenerateMonth] = useState(new Date().getMonth() + 1)
  const [generateYear, setGenerateYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()

  const loadData = async () => {
    try {
      setLoading(true)
      const [pRes, eRes] = await Promise.all([
        fetch('/api/payslips'),
        fetch('/api/employees'),
      ])
      if (!pRes.ok) throw new Error('Failed to load')
      const allPayslips = await pRes.json()
      const employees = eRes.ok ? await eRes.json() : []
      const eMap = new Map((employees || []).map((e: Employee) => [e.id, e]))
      setPayslips((allPayslips || []).map((p: Payslip) => ({
        ...p,
        employee: eMap.get(p.employeeId),
      })))
    } catch (e) {
      console.error(e)
      setPayslips([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this payslip?")) return
    try {
      const res = await fetch(`/api/payslips/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      await loadData()
    } catch (e) {
      console.error(e)
      alert('Failed to delete payslip.')
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success"
      case "issued":
        return "default"
      default:
        return "secondary"
    }
  }

  const handleGenerateMonthly = async () => {
    try {
      const employeesRes = await fetch('/api/employees')
      if (!employeesRes.ok) throw new Error('Failed to load employees')
      const employees = await employeesRes.json()
      if (!employees?.length) {
        alert("No employees found to generate payslips.")
        return
      }
      const startDate = new Date(generateYear, generateMonth - 1, 1)
      const endDate = new Date(generateYear, generateMonth, 0)
      const issueDate = new Date(generateYear, generateMonth - 1, 15)
      let created = 0
      for (const emp of employees) {
        const payslipNumber = `PS-${generateYear}${String(generateMonth).padStart(2, '0')}-${emp.employeeNumber || emp.id.slice(-6)}`
        const res = await fetch('/api/payslips', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payslipNumber,
            employeeId: emp.id,
            payPeriodStart: startDate.toISOString(),
            payPeriodEnd: endDate.toISOString(),
            issueDate: issueDate.toISOString(),
            baseSalary: emp.salary ?? 0,
            overtime: 0,
            bonuses: 0,
            deductions: 0,
            tax: 0,
            netPay: emp.salary ?? 0,
            status: 'draft',
          }),
        })
        if (res.ok) created++
      }
      if (created > 0) {
        alert(`Generated ${created} payslips for ${generateMonth}/${generateYear}`)
        await loadData()
        setShowGenerateModal(false)
      } else {
        alert("No payslips generated. They may already exist for this month.")
      }
    } catch (e) {
      console.error(e)
      alert("Failed to generate payslips.")
    }
  }

  const filteredPayslips = payslips.filter((p) =>
    p.payslipNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.employee?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.employee?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Payslips"
        description="Manage employee payslips"
        actionLabel={canEdit('payslips') ? "New Payslip" : undefined}
        actionHref={canEdit('payslips') ? "/payslips/new" : undefined}
      />

      {/* Generate Monthly Payslips Button */}
      {canEdit('payslips') && (
        <div className="flex justify-end">
          <Button
            variant="gold"
            onClick={() => setShowGenerateModal(true)}
            className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl font-bold border-2 border-blue-300/50 px-6 py-3"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Generate Monthly Payslips
          </Button>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md p-6 border-2 border-blue-400 dark:border-blue-800/60 dark:border-blue-800/60">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">Generate Monthly Payslips</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="month">Month</Label>
                <Input
                  id="month"
                  type="number"
                  min="1"
                  max="12"
                  value={generateMonth}
                  onChange={(e) => setGenerateMonth(parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  min="2020"
                  max="2100"
                  value={generateYear}
                  onChange={(e) => setGenerateYear(parseInt(e.target.value))}
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowGenerateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="gold"
                onClick={handleGenerateMonthly}
                className="flex-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50"
              >
                Generate
              </Button>
            </div>
          </Card>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search payslips..."
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
              <TableHead className="font-bold text-white">Payslip Number</TableHead>
              <TableHead className="font-bold text-white">Employee</TableHead>
              <TableHead className="font-bold text-white">Pay Period</TableHead>
              <TableHead className="font-bold text-white">Issue Date</TableHead>
              <TableHead className="font-bold text-white">Net Pay</TableHead>
              <TableHead className="font-bold text-white">Status</TableHead>
              <TableHead className="text-right font-bold text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayslips.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <CreditCard className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-300 font-medium text-lg">No payslips found</p>
                    <p className="text-gray-400 dark:text-gray-400 text-sm">Create your first payslip to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredPayslips.map((payslip) => (
                <TableRow key={payslip.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/50 transition-colors border-b border-blue-100 dark:border-blue-800">
                  <TableCell className="font-semibold text-blue-900 dark:text-blue-100">
                    {payslip.payslipNumber}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {payslip.employee ? `${payslip.employee.firstName} ${payslip.employee.lastName}` : "Unknown"}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    {formatDate(payslip.payPeriodStart)} - {formatDate(payslip.payPeriodEnd)}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{formatDate(payslip.issueDate)}</TableCell>
                  <TableCell className="font-semibold text-blue-900 dark:text-blue-100">{formatCurrency(payslip.netPay)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(payslip.status)} className="font-semibold">
                      {payslip.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/payslips/${payslip.id}`)}
                        className="hover:bg-blue-100 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit('payslips') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/payslips/${payslip.id}/edit`)}
                          className="hover:bg-blue-100 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete('payslips') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(payslip.id)}
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
