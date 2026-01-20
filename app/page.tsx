"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Receipt, ShoppingCart, Users, Building2, Truck, UserCircle, CreditCard, Settings, AlertTriangle, TrendingUp } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { quotationService, invoiceService, purchaseOrderService, customerService, vendorService, employeeService, payslipService } from "@/lib/data"
import { Quotation, Invoice, Customer, Vendor, Employee } from "@/types"
import { formatCurrency, formatDate, getResidenceStatus, calculateDaysRemaining } from "@/lib/utils"
import { SearchBar } from "@/components/shared/SearchBar"
import { ActivityFeed } from "@/components/shared/ActivityFeed"
import { RevenueChart } from "@/components/shared/RevenueChart"
import { RecentDocuments } from "@/components/shared/RecentDocuments"
import { UpcomingEvents } from "@/components/shared/UpcomingEvents"
import { AnimatedCard } from "@/components/shared/AnimatedCard"
import { GradientText } from "@/components/shared/GradientText"

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    quotations: 0,
    invoices: 0,
    purchaseOrders: 0,
    customers: 0,
  })
  const [recentQuotations, setRecentQuotations] = useState<Quotation[]>([])
  const [recentInvoices, setRecentInvoices] = useState<Invoice[]>([])
  const [financialStats, setFinancialStats] = useState({
    totalRevenue: 0,
    pendingPayments: 0,
    unpaidPayslips: 0,
  })
  const [expiringResidences, setExpiringResidences] = useState<Array<{
    id: string
    name: string
    type: 'customer' | 'vendor' | 'employee'
    expiryDate: string
    status: 'expired' | 'critical' | 'warning'
    link: string
  }>>([])
  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{
    month: string
    revenue: number
    count: number
  }>>([])

  useEffect(() => {
    const loadData = () => {
      try {
        setIsLoading(true)
      // Load counts
      const quotations = quotationService.getAll()
      const invoices = invoiceService.getAll()
      const purchaseOrders = purchaseOrderService.getAll()
      const customers = customerService.getAll()
      
      setStats({
        quotations: quotations.length,
        invoices: invoices.length,
        purchaseOrders: purchaseOrders.length,
        customers: customers.length,
      })

      // Load recent quotations (last 5)
      const recent = quotations
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
      setRecentQuotations(recent)

      // Load recent invoices (last 5)
      const recentInvs = invoices
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
      setRecentInvoices(recentInvs)

      // Calculate financial stats
      const totalRevenue = invoices
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.total, 0)

      const pendingPayments = invoices
        .filter((inv) => inv.status === 'sent' || inv.status === 'overdue')
        .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0)

      const unpaidPayslips = payslipService.getAll()
        .filter((p) => p.status !== 'paid')
        .reduce((sum, p) => sum + p.netPay, 0)

      setFinancialStats({
        totalRevenue,
        pendingPayments,
        unpaidPayslips,
      })

      // Load expiring residences
      const expiring: Array<{
        id: string
        name: string
        type: 'customer' | 'vendor' | 'employee'
        expiryDate: string
        status: 'expired' | 'critical' | 'warning'
        link: string
      }> = []

      // Check customers
      customers.forEach((customer) => {
        if (customer.residenceExpiryDate) {
          const status = getResidenceStatus(customer.residenceExpiryDate)
          if (status === 'expired' || status === 'critical' || status === 'warning') {
            expiring.push({
              id: customer.id,
              name: customer.name,
              type: 'customer',
              expiryDate: customer.residenceExpiryDate,
              status,
              link: `/customers/${customer.id}`,
            })
          }
        }
      })

      // Check vendors
      const vendors = vendorService.getAll()
      vendors.forEach((vendor) => {
        if (vendor.residenceExpiryDate) {
          const status = getResidenceStatus(vendor.residenceExpiryDate)
          if (status === 'expired' || status === 'critical' || status === 'warning') {
            expiring.push({
              id: vendor.id,
              name: vendor.name,
              type: 'vendor',
              expiryDate: vendor.residenceExpiryDate,
              status,
              link: `/vendors/${vendor.id}`,
            })
          }
        }
      })

      // Check employees
      const employees = employeeService.getAll()
      employees.forEach((employee) => {
        if (employee.residenceExpiryDate) {
          const status = getResidenceStatus(employee.residenceExpiryDate)
          if (status === 'expired' || status === 'critical' || status === 'warning') {
            expiring.push({
              id: employee.id,
              name: `${employee.firstName} ${employee.lastName}`,
              type: 'employee',
              expiryDate: employee.residenceExpiryDate,
              status,
              link: `/employees/${employee.id}`,
            })
          }
        }
      })

      // Sort by expiry date (earliest first)
      expiring.sort((a, b) => {
        const daysA = calculateDaysRemaining(a.expiryDate)
        const daysB = calculateDaysRemaining(b.expiryDate)
        return daysA - daysB
      })

      setExpiringResidences(expiring.slice(0, 5))

      // Calculate monthly revenue
      const monthlyData: Record<string, { revenue: number; count: number }> = {}
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      
      invoices
        .filter((inv) => inv.status === 'paid')
        .forEach((inv) => {
          const date = new Date(inv.date)
          const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`
          
          if (!monthlyData[monthKey]) {
            monthlyData[monthKey] = { revenue: 0, count: 0 }
          }
          monthlyData[monthKey].revenue += inv.total
          monthlyData[monthKey].count += 1
        })

      const monthlyArray = Object.entries(monthlyData)
        .map(([month, data]) => ({ month, ...data }))
        .sort((a, b) => {
          const dateA = new Date(a.month)
          const dateB = new Date(b.month)
          return dateA.getTime() - dateB.getTime()
        })
        .slice(-12) // Last 12 months

      setMonthlyRevenue(monthlyArray)
      setIsLoading(false)
      } catch (error) {
        console.error("Error loading dashboard data:", error)
        setIsLoading(false)
      }
    }

    loadData()
    
    // Reload data when window gains focus (for cross-tab updates)
    const handleFocus = () => loadData()
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fadeInUp">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 skeleton rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <div className="hidden lg:block">
        <SearchBar />
      </div>

      {/* Luxury Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-8 md:p-10 rounded-2xl shadow-luxury">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
            Dashboard
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium">
            Welcome to <span className="text-gold font-bold">ALMSAR ALZAKI T&M</span> CRM System
          </p>
        </div>
      </div>

      {/* Financial Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group relative overflow-hidden border-2 border-green-200/60 dark:border-green-800/60 hover:border-green-400 dark:hover:border-green-600 transition-all duration-500 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-white to-green-50/50 dark:from-green-900/20 dark:via-blue-900/30 dark:to-green-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Total Revenue</CardTitle>
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Receipt className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-green-700 dark:text-green-400 mb-1">{formatCurrency(financialStats.totalRevenue)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Paid invoices</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 border-orange-200/60 dark:border-orange-800/60 hover:border-orange-400 dark:hover:border-orange-600 transition-all duration-500 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-orange-50/50 dark:from-orange-900/20 dark:via-blue-900/30 dark:to-orange-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Pending Payments</CardTitle>
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-orange-700 dark:text-orange-400 mb-1">{formatCurrency(financialStats.pendingPayments)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Unpaid invoices</p>
          </CardContent>
        </Card>

        <Card className="group relative overflow-hidden border-2 border-red-200/60 dark:border-red-800/60 hover:border-red-400 dark:hover:border-red-600 transition-all duration-500 cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-50/50 dark:from-red-900/20 dark:via-blue-900/30 dark:to-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
            <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Unpaid Payslips</CardTitle>
            <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-red-700 dark:text-red-400 mb-1">{formatCurrency(financialStats.unpaidPayslips)}</div>
            <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Unpaid salaries</p>
          </CardContent>
        </Card>
      </div>

      {/* Luxury Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/quotations">
          <Card className="group relative overflow-hidden border-2 border-blue-200/60 dark:border-blue-800/60 hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-500 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-900/20 dark:via-blue-900/30 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Total Quotations</CardTitle>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-blue group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">{stats.quotations}</div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Active quotations</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/invoices">
          <Card className="group relative overflow-hidden border-2 border-gold/60 dark:border-gold/40 hover:border-gold dark:hover:border-gold/60 transition-all duration-500 cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/80 via-white to-yellow-50/40 dark:from-yellow-900/20 dark:via-blue-900/30 dark:to-yellow-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Total Invoices</CardTitle>
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-gold group-hover:scale-110 transition-transform duration-300">
                <Receipt className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">{stats.invoices}</div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">All invoices</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/purchase-orders">
          <AnimatedCard delay={200} className="group relative overflow-hidden cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-900/20 dark:via-blue-900/30 dark:to-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Purchase Orders</CardTitle>
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-blue group-hover:scale-110 transition-transform duration-300">
                <ShoppingCart className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">{stats.purchaseOrders}</div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Active orders</p>
            </CardContent>
          </AnimatedCard>
        </Link>

        <Link href="/customers">
          <AnimatedCard delay={300} className="group relative overflow-hidden cursor-pointer border-gold/60 dark:border-gold/40 hover:border-gold dark:hover:border-gold/60">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/80 via-white to-yellow-50/40 dark:from-yellow-900/20 dark:via-blue-900/30 dark:to-yellow-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
              <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Total Customers</CardTitle>
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-gold group-hover:scale-110 transition-transform duration-300">
                <Users className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">{stats.customers}</div>
              <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">Registered customers</p>
            </CardContent>
          </AnimatedCard>
        </Link>
      </div>

      {/* Revenue Chart */}
      {monthlyRevenue.length > 0 && (
        <RevenueChart monthlyData={monthlyRevenue} />
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Activity Feed */}
        <div className="md:col-span-2">
          <ActivityFeed />
        </div>

        <Card className="border-2 border-blue-200/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
              <div>
                <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Recent Quotations</CardTitle>
                <CardDescription className="mt-1 dark:text-gray-400">Latest quotation activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentQuotations.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 font-medium">
                No quotations yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentQuotations.map((quotation) => {
                  const customer = customerService.getById(quotation.customerId)
                  const getStatusBadgeVariant = (status: string) => {
                    switch (status) {
                      case "accepted": return "success"
                      case "sent": return "default"
                      case "rejected": return "destructive"
                      case "expired": return "warning"
                      default: return "secondary"
                    }
                  }
                  return (
                    <Link key={quotation.id} href={`/quotations/${quotation.id}`}>
                      <div className="p-3 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:border-blue-400 dark:hover:border-blue-600 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-blue-900 dark:text-blue-100">{quotation.quotationNumber}</span>
                            <Badge variant={getStatusBadgeVariant(quotation.status)} className="text-xs">
                              {quotation.status}
                            </Badge>
                          </div>
                          <span className="text-sm font-bold text-blue-700 dark:text-blue-300">{formatCurrency(quotation.total)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                          <span>{customer?.name || 'Unknown Customer'}</span>
                          <span>{formatDate(quotation.date)}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
            <Link href="/quotations" className="mt-4 block">
              <Button variant="outline" className="w-full border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
                View All Quotations
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 border-gold/60 dark:border-gold/40 shadow-gold hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-gold/10 to-yellow-50 dark:from-gold/20 dark:to-blue-900/30">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full"></div>
              <div>
                <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Recent Invoices</CardTitle>
                <CardDescription className="mt-1 dark:text-gray-400">Latest invoice activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400 font-medium">
                No invoices yet
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => {
                  const customer = customerService.getById(invoice.customerId)
                  const getStatusBadgeVariant = (status: string) => {
                    switch (status) {
                      case "paid": return "success"
                      case "sent": return "default"
                      case "overdue": return "destructive"
                      case "draft": return "default"
                      default: return "default"
                    }
                  }
                  return (
                    <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                      <div className="p-3 border border-yellow-200 dark:border-yellow-800 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-400 dark:hover:border-yellow-600 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-blue-900 dark:text-blue-100">{invoice.invoiceNumber}</span>
                            <Badge variant={getStatusBadgeVariant(invoice.status)} className="text-xs">
                              {invoice.status}
                            </Badge>
                          </div>
                          <span className="text-sm font-bold text-yellow-700 dark:text-yellow-400">{formatCurrency(invoice.total)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                          <span>{customer?.name || 'Unknown Customer'}</span>
                          <span>{formatDate(invoice.date)}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
            <Link href="/invoices" className="mt-4 block">
              <Button variant="outline" className="w-full font-semibold">
                View All Invoices
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-card">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
              <div>
                <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Recent Projects</CardTitle>
                <CardDescription className="mt-1 dark:text-gray-400">Latest project activity</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 font-medium">
              No projects yet
            </div>
            <Link href="/projects">
              <Button variant="outline" className="w-full border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
                View All Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Residences Widget */}
      {expiringResidences.length > 0 && (
        <Card className="border-2 border-red-200/60 dark:border-red-800/60 shadow-card hover:shadow-card-hover transition-all duration-300 bg-gradient-to-br from-red-50/50 to-white dark:from-red-900/20 dark:to-blue-900/30">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1 h-8 bg-gradient-to-b from-red-600 to-red-800 rounded-full"></div>
                <div>
                  <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Expiring Residences</CardTitle>
                  <CardDescription className="mt-1 dark:text-gray-400">Residences expiring soon - Action required</CardDescription>
                </div>
              </div>
              <Link href="/expiring-residences">
                <Button variant="outline" size="sm" className="border-2 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50 hover:border-red-500 dark:hover:border-red-600 font-semibold">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringResidences.map((residence) => {
                const daysRemaining = calculateDaysRemaining(residence.expiryDate)
                const daysText = daysRemaining < 0 ? 'منتهية' : `${daysRemaining} يوم متبقي`
                
                let badgeVariant: 'destructive' | 'warning' | 'default' = 'default'
                if (residence.status === 'expired') badgeVariant = 'destructive'
                else if (residence.status === 'critical') badgeVariant = 'destructive'
                else if (residence.status === 'warning') badgeVariant = 'warning'

                return (
                  <Link key={`${residence.type}-${residence.id}`} href={residence.link}>
                    <div className="p-3 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-400 dark:hover:border-red-600 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-blue-900 dark:text-blue-100">{residence.name}</span>
                          <Badge variant={badgeVariant} className="text-xs">
                            {residence.type}
                          </Badge>
                        </div>
                        <Badge variant={badgeVariant} className="font-bold">
                          {daysText}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                        <span>Expiry: {formatDate(residence.expiryDate)}</span>
                        {residence.status === 'expired' && (
                          <span className="text-red-600 dark:text-red-400 font-semibold">منتهية</span>
                        )}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-6 flex items-center gap-3">
          <span className="w-1 h-8 bg-gradient-to-b from-blue-600 to-gold rounded-full"></span>
          Quick Actions
        </h2>
        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
          <Link href="/quotations/new">
            <Card className="group cursor-pointer border-2 border-blue-200/60 dark:border-blue-800/60 hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-luxury shadow-card bg-gradient-card">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-blue group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">Create Quotation</CardTitle>
                </div>
                <CardDescription className="text-sm dark:text-gray-400">Generate a new quotation</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/invoices/new">
            <Card className="group cursor-pointer border-2 border-gold/60 dark:border-gold/40 hover:border-gold dark:hover:border-gold/60 transition-all duration-300 hover:shadow-luxury shadow-gold bg-gradient-to-br from-gold/10 to-yellow-50 dark:from-gold/20 dark:to-blue-900/30">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-gold group-hover:scale-110 transition-transform duration-300">
                    <Receipt className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">Create Invoice</CardTitle>
                </div>
                <CardDescription className="text-sm dark:text-gray-400">Generate a new invoice</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/customers/new">
            <Card className="group cursor-pointer border-2 border-blue-200/60 dark:border-blue-800/60 hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-luxury shadow-card bg-gradient-card">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-blue group-hover:scale-110 transition-transform duration-300">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">Add Customer</CardTitle>
                </div>
                <CardDescription className="text-sm dark:text-gray-400">Register a new customer</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/projects/new">
            <Card className="group cursor-pointer border-2 border-blue-200/60 dark:border-blue-800/60 hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-luxury shadow-card bg-gradient-card">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-blue group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">New Project</CardTitle>
                </div>
                <CardDescription className="text-sm dark:text-gray-400">Create a new project</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/purchase-orders/new">
            <Card className="group cursor-pointer border-2 border-gold/60 dark:border-gold/40 hover:border-gold dark:hover:border-gold/60 transition-all duration-300 hover:shadow-luxury shadow-gold bg-gradient-to-br from-gold/10 to-yellow-50 dark:from-gold/20 dark:to-blue-900/30">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-gold group-hover:scale-110 transition-transform duration-300">
                    <ShoppingCart className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">Purchase Order</CardTitle>
                </div>
                <CardDescription className="text-sm dark:text-gray-400">Create purchase order</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/receipts/new">
            <Card className="group cursor-pointer border-2 border-blue-200/60 dark:border-blue-800/60 hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-luxury shadow-card bg-gradient-card">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-blue group-hover:scale-110 transition-transform duration-300">
                    <Receipt className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">New Receipt</CardTitle>
                </div>
                <CardDescription className="text-sm dark:text-gray-400">Record a new receipt</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/vendors/new">
            <Card className="group cursor-pointer border-2 border-gold/60 dark:border-gold/40 hover:border-gold dark:hover:border-gold/60 transition-all duration-300 hover:shadow-luxury shadow-gold bg-gradient-to-br from-gold/10 to-yellow-50 dark:from-gold/20 dark:to-blue-900/30">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-gold group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">Add Vendor</CardTitle>
                </div>
                <CardDescription className="text-sm dark:text-gray-400">Register a new vendor</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/vehicles/new">
            <Card className="group cursor-pointer border-2 border-blue-200/60 dark:border-blue-800/60 hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-luxury shadow-card bg-gradient-card">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-blue group-hover:scale-110 transition-transform duration-300">
                    <Truck className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">Add Vehicle</CardTitle>
                </div>
                <CardDescription className="text-sm dark:text-gray-400">Register a new vehicle</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/employees/new">
            <Card className="group cursor-pointer border-2 border-gold/60 dark:border-gold/40 hover:border-gold dark:hover:border-gold/60 transition-all duration-300 hover:shadow-luxury shadow-gold bg-gradient-to-br from-gold/10 to-yellow-50 dark:from-gold/20 dark:to-blue-900/30">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/50 to-transparent dark:from-yellow-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-gold group-hover:scale-110 transition-transform duration-300">
                    <UserCircle className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">Add Employee</CardTitle>
                </div>
                <CardDescription className="text-sm dark:text-gray-400">Register a new employee</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/payslips/new">
            <Card className="group cursor-pointer border-2 border-blue-200/60 dark:border-blue-800/60 hover:border-blue-500 dark:hover:border-blue-600 transition-all duration-300 hover:shadow-luxury shadow-card bg-gradient-card">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-blue group-hover:scale-110 transition-transform duration-300">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100">Create Payslip</CardTitle>
                </div>
                <CardDescription className="text-sm dark:text-gray-400">Generate payslip</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>

      {/* All Sections Links */}
      <div>
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-6 flex items-center gap-3">
          <span className="w-1 h-8 bg-gradient-to-b from-blue-600 to-gold rounded-full"></span>
          All Sections
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href="/projects">
            <Button variant="outline" className="w-full justify-start h-auto py-4 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
              <FileText className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Projects</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">Manage all projects</div>
              </div>
            </Button>
          </Link>

          <Link href="/quotations">
            <Button variant="outline" className="w-full justify-start h-auto py-4 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
              <FileText className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Quotations</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">View all quotations</div>
              </div>
            </Button>
          </Link>

          <Link href="/purchase-orders">
            <Button variant="outline" className="w-full justify-start h-auto py-4 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
              <ShoppingCart className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Purchase Orders</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">Manage orders</div>
              </div>
            </Button>
          </Link>

          <Link href="/invoices">
            <Button variant="outline" className="w-full justify-start h-auto py-4 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
              <Receipt className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Invoices</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">View all invoices</div>
              </div>
            </Button>
          </Link>

          <Link href="/receipts">
            <Button variant="outline" className="w-full justify-start h-auto py-4 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
              <Receipt className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Receipts</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">View all receipts</div>
              </div>
            </Button>
          </Link>

          <Link href="/customers">
            <Button variant="outline" className="w-full justify-start h-auto py-4 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
              <Users className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Customers</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">Manage customers</div>
              </div>
            </Button>
          </Link>

          <Link href="/vendors">
            <Button variant="outline" className="w-full justify-start h-auto py-4 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
              <Building2 className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Vendors</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">Manage vendors</div>
              </div>
            </Button>
          </Link>

          <Link href="/vehicles">
            <Button variant="outline" className="w-full justify-start h-auto py-4 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
              <Truck className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Vehicles</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">Manage fleet</div>
              </div>
            </Button>
          </Link>

          <Link href="/employees">
            <Button variant="outline" className="w-full justify-start h-auto py-4 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
              <UserCircle className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Employees</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">Manage staff</div>
              </div>
            </Button>
          </Link>

          <Link href="/payslips">
            <Button variant="outline" className="w-full justify-start h-auto py-4 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
              <CreditCard className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Payslips</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">Manage payslips</div>
              </div>
            </Button>
          </Link>

          <Link href="/pending-payments">
            <Button variant="outline" className="w-full justify-start h-auto py-4 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
              <CreditCard className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Pending Payments</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">View pending</div>
              </div>
            </Button>
          </Link>

          <Link href="/settings">
            <Button variant="outline" className="w-full justify-start h-auto py-4 border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
              <Settings className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Settings</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">System settings</div>
              </div>
            </Button>
          </Link>

          <Link href="/reports">
            <Button variant="outline" className="w-full justify-start h-auto py-4 border-2 border-gold/60 dark:border-gold/40 text-gold dark:text-yellow-400 hover:bg-gold/10 dark:hover:bg-gold/20 hover:border-gold dark:hover:border-gold/60 font-semibold">
              <TrendingUp className="mr-3 h-5 w-5" />
              <div className="text-left">
                <div className="font-bold">Reports & Analytics</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-normal">View reports and metrics</div>
              </div>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
