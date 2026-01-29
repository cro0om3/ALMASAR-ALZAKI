"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, ArrowLeft, Eye } from "lucide-react"
import { Employee, Payslip } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function EmployeeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canEdit } = usePermissions()
  const [employee, setEmployee] = useState<Employee | null>(null)
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const id = params.id as string
    if (!id) return
    let cancelled = false
    setLoading(true)
    Promise.all([
      fetch(`/api/employees/${id}`).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/payslips').then((r) => (r.ok ? r.json() : [])),
    ]).then(([e, allPayslips]) => {
      if (cancelled) return
      setEmployee(e || null)
      const employeePayslips = (allPayslips || []).filter((p: Payslip) => p.employeeId === id)
      employeePayslips.sort((a: Payslip, b: Payslip) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
      setPayslips(employeePayslips)
    }).catch(() => { if (!cancelled) setEmployee(null); setPayslips([]) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }
  if (!employee) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Employee not found</p>
      </div>
    )
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "inactive":
        return "warning"
      case "terminated":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPayslipStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "success"
      case "issued":
        return "default"
      default:
        return "secondary"
    }
  }

  const totalPayslips = payslips.reduce((sum, p) => sum + p.netPay, 0)
  const averagePayslip = payslips.length > 0 ? totalPayslips / payslips.length : 0
  const lastPayslip = payslips[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-muted-foreground">Employee details</p>
          </div>
        </div>
        {canEdit('employees') && (
          <Button onClick={() => router.push(`/employees/${employee.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Employee Number:</strong> {employee.employeeNumber}</p>
            <p><strong>Name:</strong> {employee.firstName} {employee.lastName}</p>
            <p><strong>Email:</strong> {employee.email}</p>
            <p><strong>Phone:</strong> {employee.phone}</p>
            <p><strong>Address:</strong> {employee.address}</p>
            <p>{employee.city}, {employee.state} {employee.zipCode}</p>
            <p>{employee.country}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Employment Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Position:</strong> {employee.position}</p>
            <p><strong>Department:</strong> {employee.department}</p>
            <p><strong>Hire Date:</strong> {formatDate(employee.hireDate)}</p>
            <p><strong>Salary:</strong> {formatCurrency(employee.salary)}</p>
            <p><strong>Status:</strong>{" "}
              <Badge variant={getStatusBadgeVariant(employee.status)}>
                {employee.status}
              </Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payslip History */}
      <Card className="border-2 border-blue-400 dark:border-blue-800/60">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
            <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Payslip History</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {payslips.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-300 font-medium">
              No payslips found for this employee
            </div>
          ) : (
            <>
              {/* Statistics */}
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="p-4 border border-blue-400 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">Total Payslips</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{payslips.length}</p>
                </div>
                <div className="p-4 border border-blue-400 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">Total Paid</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalPayslips)}</p>
                </div>
                <div className="p-4 border border-blue-400 dark:border-blue-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium mb-1">Average Payslip</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(averagePayslip)}</p>
                </div>
              </div>

              {/* Payslips Table */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-b-0">
                    <TableHead className="font-bold text-white">Payslip Number</TableHead>
                    <TableHead className="font-bold text-white">Pay Period</TableHead>
                    <TableHead className="font-bold text-white">Issue Date</TableHead>
                    <TableHead className="font-bold text-white">Net Pay</TableHead>
                    <TableHead className="font-bold text-white">Status</TableHead>
                    <TableHead className="text-right font-bold text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payslips.map((payslip) => (
                    <TableRow key={payslip.id} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800">
                      <TableCell className="font-semibold text-blue-900 dark:text-blue-100">
                        {payslip.payslipNumber}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">
                        {formatDate(payslip.payPeriodStart)} - {formatDate(payslip.payPeriodEnd)}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">{formatDate(payslip.issueDate)}</TableCell>
                      <TableCell className="font-semibold text-blue-900 dark:text-blue-100">{formatCurrency(payslip.netPay)}</TableCell>
                      <TableCell>
                        <Badge variant={getPayslipStatusBadgeVariant(payslip.status)}>
                          {payslip.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/payslips/${payslip.id}`}>
                          <Button variant="ghost" size="icon" className="hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-700 dark:hover:text-blue-300">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {lastPayslip && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-400 dark:border-blue-800">
                  <p className="text-sm text-gray-600">
                    <strong>Last Payslip:</strong> {lastPayslip.payslipNumber} - {formatDate(lastPayslip.issueDate)} - {formatCurrency(lastPayslip.netPay)}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
