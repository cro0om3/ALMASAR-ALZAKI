"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { customerService, vendorService, employeeService } from "@/lib/data"
import { Customer, Vendor, Employee } from "@/types"
import { formatDate, getResidenceStatus, calculateDaysRemaining } from "@/lib/utils"
import { AlertTriangle, Users, Building2, UserCircle } from "lucide-react"

interface ExpiringResidence {
  id: string
  name: string
  type: 'customer' | 'vendor' | 'employee'
  expiryDate: string
  status: 'expired' | 'critical' | 'warning'
  link: string
  nationality?: string
  idNumber?: string
}

export default function ExpiringResidencesPage() {
  const [residences, setResidences] = useState<ExpiringResidence[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    loadResidences()
  }, [])

  const loadResidences = () => {
    const expiring: ExpiringResidence[] = []

    // Check customers
    const customers = customerService.getAll()
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
            nationality: customer.nationality,
            idNumber: customer.idNumber,
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
            nationality: vendor.nationality,
            idNumber: vendor.idNumber,
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
            nationality: employee.nationality,
            idNumber: employee.idNumber,
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

    setResidences(expiring)
  }

  const filteredResidences = residences.filter((residence) => {
    if (statusFilter !== "all" && residence.status !== statusFilter) return false
    if (typeFilter !== "all" && residence.type !== typeFilter) return false
    return true
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "expired":
        return "destructive"
      case "critical":
        return "destructive"
      case "warning":
        return "warning"
      default:
        return "default"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "customer":
        return <Users className="h-4 w-4" />
      case "vendor":
        return <Building2 className="h-4 w-4" />
      case "employee":
        return <UserCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusCount = (status: string) => {
    return residences.filter((r) => r.status === status).length
  }

  return (
    <div className="space-y-8">
      {/* Luxury Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white p-8 md:p-10 rounded-2xl shadow-luxury">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-red/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-8 w-8" />
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Expiring Residences
            </h1>
          </div>
          <p className="text-red-100 text-lg md:text-xl font-medium">
            Manage residences expiring soon - Action required
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-2 border-red-200/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">Total Expiring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{residences.length}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-300/60 dark:border-red-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-red-900 dark:text-red-300">Expired</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">{getStatusCount('expired')}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-200/60 dark:border-red-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-orange-900 dark:text-orange-300">Critical (0-7 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">{getStatusCount('critical')}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-yellow-200/60 dark:border-yellow-800/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-yellow-900 dark:text-yellow-300">Warning (8-30 days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{getStatusCount('warning')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-2 border-blue-200/60">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-blue-900 dark:text-blue-100">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="critical">Critical (0-7 days)</SelectItem>
                  <SelectItem value="warning">Warning (8-30 days)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-blue-900 dark:text-blue-100">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Residences Table */}
      <Card className="border-2 border-blue-200/60 shadow-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Expiring Residences List</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredResidences.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-300 font-medium">
              No expiring residences found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/50 dark:to-blue-800/50 border-b-2 border-blue-200 dark:border-blue-800">
                  <TableHead className="font-bold text-blue-900 dark:text-blue-100">Type</TableHead>
                  <TableHead className="font-bold text-blue-900 dark:text-blue-100">Name</TableHead>
                  <TableHead className="font-bold text-blue-900 dark:text-blue-100">ID Number</TableHead>
                  <TableHead className="font-bold text-blue-900 dark:text-blue-100">Nationality</TableHead>
                  <TableHead className="font-bold text-blue-900 dark:text-blue-100">Expiry Date</TableHead>
                  <TableHead className="font-bold text-blue-900 dark:text-blue-100">Days Remaining</TableHead>
                  <TableHead className="font-bold text-blue-900 dark:text-blue-100">Status</TableHead>
                  <TableHead className="text-right font-bold text-blue-900 dark:text-blue-100">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResidences.map((residence) => {
                  const daysRemaining = calculateDaysRemaining(residence.expiryDate)
                  const daysText = daysRemaining < 0 ? 'منتهية' : `${daysRemaining} يوم`

                  return (
                    <TableRow key={`${residence.type}-${residence.id}`} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/30 border-b border-blue-100 dark:border-blue-800">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(residence.type)}
                          <span className="font-medium text-blue-900 dark:text-blue-100 capitalize">{residence.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-blue-900 dark:text-blue-100">{residence.name}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">{residence.idNumber || 'N/A'}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">{residence.nationality || 'N/A'}</TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-300">{formatDate(residence.expiryDate)}</TableCell>
                      <TableCell>
                        <span className={daysRemaining < 0 ? 'text-red-600 dark:text-red-400 font-bold' : daysRemaining <= 7 ? 'text-orange-600 dark:text-orange-400 font-bold' : 'text-yellow-600 dark:text-yellow-400 font-bold'}>
                          {daysText}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(residence.status)}>
                          {residence.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={residence.link}>
                          <Button variant="outline" size="sm" className="border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold">
                            View Details
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
