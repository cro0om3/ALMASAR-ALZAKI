"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Edit, ArrowLeft, Download, CheckCircle } from "lucide-react"
import { payslipService } from "@/lib/data"
import { employeeService } from "@/lib/data"
import { Payslip, PaymentMethod } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function PayslipDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canEdit } = usePermissions()
  const [payslip, setPayslip] = useState<Payslip | null>(null)

  useEffect(() => {
    const id = params.id as string
    const p = payslipService.getById(id)
    if (p) {
      const employee = employeeService.getById(p.employeeId)
      setPayslip({ ...p, employee })
    }
  }, [params.id])

  if (!payslip) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Payslip not found</p>
      </div>
    )
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

  const handleMarkAsPaid = () => {
    if (confirm("Mark this payslip as paid?")) {
      const updated = payslipService.update(payslip.id, {
        status: 'paid',
        paymentDate: new Date().toISOString().split('T')[0],
      })
      if (updated) {
        const employee = employeeService.getById(updated.employeeId)
        setPayslip({ ...updated, employee })
      }
    }
  }

  const handleDownload = () => {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Payslip ${payslip.payslipNumber}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total { font-weight: bold; font-size: 1.2em; }
            </style>
          </head>
          <body>
            <h1>Payslip ${payslip.payslipNumber}</h1>
            <p><strong>Employee:</strong> ${payslip.employee ? `${payslip.employee.firstName} ${payslip.employee.lastName}` : "N/A"}</p>
            <p><strong>Pay Period:</strong> ${formatDate(payslip.payPeriodStart)} - ${formatDate(payslip.payPeriodEnd)}</p>
            <p><strong>Issue Date:</strong> ${formatDate(payslip.issueDate)}</p>
            ${payslip.paymentDate ? `<p><strong>Payment Date:</strong> ${formatDate(payslip.paymentDate)}</p>` : ""}
            <table>
              <tr>
                <th>Earnings</th>
                <th>Amount</th>
              </tr>
              <tr>
                <td>Base Salary</td>
                <td>${formatCurrency(payslip.baseSalary)}</td>
              </tr>
              <tr>
                <td>Overtime</td>
                <td>${formatCurrency(payslip.overtime)}</td>
              </tr>
              <tr>
                <td>Bonuses</td>
                <td>${formatCurrency(payslip.bonuses)}</td>
              </tr>
              <tr>
                <th>Deductions</th>
                <th>Amount</th>
              </tr>
              <tr>
                <td>Deductions</td>
                <td>${formatCurrency(payslip.deductions)}</td>
              </tr>
              <tr>
                <td>Tax</td>
                <td>${formatCurrency(payslip.tax)}</td>
              </tr>
              <tr class="total">
                <td>Net Pay</td>
                <td>${formatCurrency(payslip.netPay)}</td>
              </tr>
            </table>
            ${payslip.notes ? `<p><strong>Notes:</strong> ${payslip.notes}</p>` : ""}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Payslip {payslip.payslipNumber}</h1>
            <p className="text-muted-foreground">View payslip details</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {payslip.status !== 'paid' && (
            <Button
              variant="gold"
              onClick={handleMarkAsPaid}
              className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white hover:from-green-600 hover:via-green-700 hover:to-green-800 shadow-lg hover:shadow-xl font-bold border-2 border-green-300/50 px-6 py-3"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Paid
            </Button>
          )}
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          {canEdit('payslips') && (
            <Button onClick={() => router.push(`/payslips/${payslip.id}/edit`)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Employee Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Name:</strong> {payslip.employee ? `${payslip.employee.firstName} ${payslip.employee.lastName}` : "N/A"}</p>
            <p><strong>Employee Number:</strong> {payslip.employee?.employeeNumber || "N/A"}</p>
            <p><strong>Position:</strong> {payslip.employee?.position || "N/A"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payslip Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Pay Period:</strong> {formatDate(payslip.payPeriodStart)} - {formatDate(payslip.payPeriodEnd)}</p>
            <p><strong>Issue Date:</strong> {formatDate(payslip.issueDate)}</p>
            <p><strong>Status:</strong>{" "}
              <Badge variant={getStatusBadgeVariant(payslip.status)}>
                {payslip.status}
              </Badge>
            </p>
            {payslip.paymentDate && (
              <p><strong>Payment Date:</strong> {formatDate(payslip.paymentDate)}</p>
            )}
            {payslip.paymentMethod && (
              <p><strong>Payment Method:</strong> {payslip.paymentMethod}</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pay Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Earnings</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base Salary:</span>
                  <span>{formatCurrency(payslip.baseSalary)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Overtime:</span>
                  <span>{formatCurrency(payslip.overtime)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bonuses:</span>
                  <span>{formatCurrency(payslip.bonuses)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total Earnings:</span>
                  <span>{formatCurrency(payslip.baseSalary + payslip.overtime + payslip.bonuses)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Deductions</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Deductions:</span>
                  <span>{formatCurrency(payslip.deductions)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax:</span>
                  <span>{formatCurrency(payslip.tax)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Total Deductions:</span>
                  <span>{formatCurrency(payslip.deductions + payslip.tax)}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between font-bold text-lg pt-4 border-t">
              <span>Net Pay:</span>
              <span>{formatCurrency(payslip.netPay)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {payslip.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{payslip.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
