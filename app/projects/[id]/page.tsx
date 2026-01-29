"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Plus, Calendar, Truck, Clock, FileText } from "lucide-react"
import { Project, UsageEntry } from "@/types/project"
import { formatCurrency, formatDate } from "@/lib/utils"
import Link from "next/link"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canEdit } = usePermissions()
  const [project, setProject] = useState<Project | null>(null)
  const [usageEntries, setUsageEntries] = useState<UsageEntry[]>([])
  const [monthlyInvoices, setMonthlyInvoices] = useState<any[]>([])
  const [customer, setCustomer] = useState<any>(null)
  const [quotation, setQuotation] = useState<any>(null)
  const [vehicles, setVehicles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
        const [pRes, useRes, invRes, customers, quotations, vehiclesList] = await Promise.all([
          fetch(`/api/projects/${id}`),
          fetch(`/api/usage-entries?projectId=${id}`),
          fetch(`/api/monthly-invoices?projectId=${id}`),
          fetch('/api/customers').then((r) => r.ok ? r.json() : []),
          fetch('/api/quotations').then((r) => r.ok ? r.json() : []),
          fetch('/api/vehicles').then((r) => r.ok ? r.json() : []),
        ])
        if (cancelled) return
        const p = pRes.ok ? await pRes.json() : null
        const use = useRes.ok ? await useRes.json() : []
        const inv = invRes.ok ? await invRes.json() : []
        setProject(p)
        setUsageEntries(use || [])
        setMonthlyInvoices(inv || [])
        if (p) {
          setCustomer((customers || []).find((c: any) => c.id === p.customerId))
          setQuotation((quotations || []).find((q: any) => q.id === p.quotationId))
          setVehicles((p.assignedVehicles || []).map((vId: string) => (vehiclesList || []).find((v: any) => v.id === vId)).filter(Boolean))
        } else {
          setCustomer(null)
          setQuotation(null)
          setVehicles([])
        }
      } catch (e) {
        if (!cancelled) setProject(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [params.id])

  const handleGenerateMonthlyInvoice = async (month: number, year: number) => {
    if (!project) return
    try {
      const qRes = await fetch(`/api/quotations/${project.quotationId}`)
      const quotation = qRes.ok ? await qRes.json() : null
      const taxRate = quotation?.taxRate || 5
      const startDate = new Date(year, month - 1, 1)
      const endDate = new Date(year, month, 0)
      const res = await fetch('/api/monthly-invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoiceNumber: `MI-${year}${String(month).padStart(2, '0')}-${project.projectNumber}`,
          projectId: project.id,
          customerId: project.customerId,
          month,
          year,
          usageEntries: [],
          subtotal: 0,
          taxRate,
          taxAmount: 0,
          total: 0,
          status: 'draft',
          date: startDate.toISOString(),
          dueDate: endDate.toISOString(),
          paidAmount: 0,
          notes: '',
        }),
      })
      if (res.ok) {
        const inv = await res.json()
        alert(`Monthly invoice created: ${inv.invoiceNumber}`)
        const invRes = await fetch(`/api/monthly-invoices?projectId=${project.id}`)
        const list = invRes.ok ? await invRes.json() : []
        setMonthlyInvoices(list || [])
      } else {
        alert("Failed to create monthly invoice.")
      }
    } catch (e) {
      console.error(e)
      alert("Failed to create monthly invoice.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }
  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    )
  }

  // Calculate totals
  const totalHours = usageEntries.filter(u => !u.invoiced).reduce((sum, u) => sum + (u.hours || 0), 0)
  const totalDays = usageEntries.filter(u => !u.invoiced).reduce((sum, u) => sum + (u.days || 0), 0)
  const totalAmount = usageEntries.filter(u => !u.invoiced).reduce((sum, u) => sum + u.total, 0)

  // Get current month
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-8 md:p-10 rounded-2xl shadow-luxury">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/20">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{project.title}</h1>
              <p className="text-blue-100 text-lg font-medium">Project Number: {project.projectNumber}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <Button
              variant="gold"
              onClick={() => router.push(`/projects/${project.id}/usage/new`)}
              className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-6 py-3"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Usage
            </Button>
            <Button
              variant="gold"
              onClick={() => handleGenerateMonthlyInvoice(currentMonth, currentYear)}
              className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-6 py-3"
            >
              <FileText className="mr-2 h-5 w-5" />
              Generate Monthly Invoice
            </Button>
            {canEdit('projects') && (
              <Button
                variant="gold"
                onClick={() => router.push(`/projects/${project.id}/edit`)}
                className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-6 py-3"
              >
                <Edit className="mr-2 h-5 w-5" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-2 border-blue-400 dark:border-blue-800/60">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Project Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Customer:</span>
              <span className="text-gray-700 dark:text-gray-300 font-semibold">{customer?.name || "N/A"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Quotation:</span>
              <span className="text-gray-700 dark:text-gray-300">{quotation?.quotationNumber || "N/A"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Billing Type:</span>
              <Badge className="font-semibold">
                {project.billingType === 'hours' ? 'By Hours' : 
                 project.billingType === 'days' ? 'By Days' : 'Fixed Amount'}
              </Badge>
            </div>
            {project.billingType === 'hours' && project.hourlyRate && (
              <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Rate/Hour:</span>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">{formatCurrency(project.hourlyRate)}</span>
              </div>
            )}
            {project.billingType === 'days' && project.dailyRate && (
              <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Rate/Day:</span>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">{formatCurrency(project.dailyRate)}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Status:</span>
              <Badge variant={project.status === 'active' ? 'success' : 'default'} className="font-semibold">
                {project.status}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gold/60 dark:border-gold/40">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-gold to-gold-dark rounded-full"></div>
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Assigned Vehicles</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                vehicle ? (
                  <div key={vehicle.id} className="flex items-center gap-2 py-2 border-b border-blue-100 dark:border-blue-800">
                    <Truck className="h-4 w-4 text-gold dark:text-yellow-400" />
                    <span className="text-gray-700 dark:text-gray-300">{vehicle.make} {vehicle.model} - {vehicle.licensePlate}</span>
                  </div>
                ) : null
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No vehicles assigned</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/projects/${project.id}/assign-vehicles`)}
              className="w-full border-gold dark:border-yellow-400 text-gold dark:text-yellow-400 hover:bg-gold dark:hover:bg-yellow-500 hover:text-white dark:hover:text-blue-900"
            >
              <Plus className="mr-2 h-4 w-4" />
              Assign Vehicles
            </Button>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-400 dark:border-blue-800/60">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Usage Summary</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {project.billingType === 'hours' && (
              <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Total Hours:</span>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">{totalHours.toFixed(2)} hours</span>
              </div>
            )}
            {project.billingType === 'days' && (
              <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
                <span className="text-gray-600 dark:text-gray-300 font-medium">Total Days:</span>
                <span className="text-gray-700 dark:text-gray-300 font-semibold">{totalDays} days</span>
              </div>
            )}
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Usage Entries:</span>
              <span className="text-gray-700 dark:text-gray-300 font-semibold">{usageEntries.filter(u => !u.invoiced).length}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Total:</span>
              <span className="text-gold dark:text-yellow-400 font-bold text-lg">{formatCurrency(totalAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Entries List */}
      <Card className="border-2 border-blue-400 dark:border-blue-800/60">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Usage Log</CardTitle>
            </div>
            <Button
              onClick={() => router.push(`/projects/${project.id}/usage/new`)}
              className="bg-gold dark:bg-yellow-500 hover:bg-gold-dark dark:hover:bg-yellow-600 text-blue-900 dark:text-blue-900 font-bold shadow-gold"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Usage
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-blue-100 dark:border-blue-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-white dark:bg-blue-900/50">
                <tr className="border-b-2 border-blue-400 dark:border-blue-700">
                  <th className="text-left p-3 font-bold text-blue-900 dark:text-blue-100">Date</th>
                  <th className="text-left p-3 font-bold text-blue-900 dark:text-blue-100">Vehicle</th>
                  {project.billingType === 'hours' && (
                    <th className="text-left p-3 font-bold text-blue-900 dark:text-blue-100">Hours</th>
                  )}
                  {project.billingType === 'days' && (
                    <th className="text-left p-3 font-bold text-blue-900 dark:text-blue-100">Days</th>
                  )}
                  <th className="text-left p-3 font-bold text-blue-900 dark:text-blue-100">Description</th>
                  <th className="text-left p-3 font-bold text-blue-900 dark:text-blue-100">Total</th>
                  <th className="text-left p-3 font-bold text-blue-900 dark:text-blue-100">Status</th>
                </tr>
              </thead>
              <tbody>
                {usageEntries.length === 0 ? (
                  <tr>
                    <td colSpan={project.billingType === 'hours' ? 7 : 7} className="text-center py-12 text-gray-500 dark:text-gray-400">
                      No usage entries recorded
                    </td>
                  </tr>
                ) : (
                  usageEntries.map((entry) => {
                    const vehicle = (vehicles || []).find((v: any) => v.id === entry.vehicleId)
                    return (
                      <tr key={entry.id} className="border-b border-blue-100 dark:border-blue-800 hover:bg-blue-50/30 dark:hover:bg-blue-900/30">
                        <td className="p-3 text-gray-700 dark:text-gray-300">{formatDate(entry.date)}</td>
                        <td className="p-3 text-gray-700 dark:text-gray-300">
                          {vehicle ? `${vehicle.make} ${vehicle.model}` : "N/A"}
                        </td>
                        {project.billingType === 'hours' && (
                          <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">{entry.hours?.toFixed(2) || 0} hours</td>
                        )}
                        {project.billingType === 'days' && (
                          <td className="p-3 text-gray-700 dark:text-gray-300 font-medium">{entry.days || 0} days</td>
                        )}
                        <td className="p-3 text-gray-600 dark:text-gray-300">{entry.description}</td>
                        <td className="p-3 text-blue-900 dark:text-blue-100 font-semibold">{formatCurrency(entry.total)}</td>
                        <td className="p-3">
                          <Badge variant={entry.invoiced ? 'success' : 'default'} className="font-semibold">
                            {entry.invoiced ? 'Invoiced' : 'Not Invoiced'}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Invoices */}
      {monthlyInvoices.length > 0 && (
        <Card className="border-2 border-gold/60 dark:border-gold/40">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-gold to-gold-dark rounded-full"></div>
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Monthly Invoices</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {monthlyInvoices.map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/50 dark:to-blue-900/30 rounded-lg border border-blue-400 dark:border-blue-800">
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">{invoice.invoiceNumber}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {invoice.month}/{invoice.year}
                      {invoice.totalHours && ` - ${invoice.totalHours.toFixed(2)} hours`}
                      {invoice.totalDays && ` - ${invoice.totalDays} days`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gold dark:text-yellow-400 text-lg">{formatCurrency(invoice.total)}</span>
                    <Badge variant={invoice.status === 'paid' ? 'success' : 'default'} className="font-semibold">
                      {invoice.status}
                    </Badge>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="hover:bg-blue-100 dark:hover:bg-blue-900"
                      onClick={async () => {
                        const res = await fetch('/api/invoices')
                        if (!res.ok) return
                        const invoices = await res.json()
                        const regularInvoice = (invoices || []).find((inv: any) => inv.invoiceNumber === invoice.invoiceNumber)
                        if (regularInvoice) router.push(`/invoices/${regularInvoice.id}`)
                      }}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
