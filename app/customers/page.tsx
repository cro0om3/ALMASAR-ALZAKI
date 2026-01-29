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
import { Plus, Search, Edit, Trash2, Eye, Users, Download, FileSpreadsheet, FileText, File } from "lucide-react"
import { Customer } from "@/types"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"
import { usePermissions } from "@/lib/hooks/use-permissions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { exportCustomerToExcel, exportCustomerToWord, exportCustomerToPDF } from "@/lib/utils/export-utils"
import { useToast } from "@/lib/hooks/use-toast"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()
  const { toast } = useToast()

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/customers')
      if (!response.ok) throw new Error('Failed to load customers')
      const data = await response.json()
      setCustomers(data)
    } catch (error: any) {
      console.error('Error loading customers:', error)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this customer?")) {
      try {
        const response = await fetch(`/api/customers/${id}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to delete customer')
        await loadCustomers() // Reload from API
      } catch (error: any) {
        console.error('Error deleting customer:', error)
        alert('Failed to delete customer. Please try again.')
      }
    }
  }

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  )

  const handleExportCustomer = (customer: Customer, type: 'excel' | 'word' | 'pdf') => {
    try {
      const filename = `Customer_${customer.name || customer.id}_${new Date().toISOString().split('T')[0]}`
      const customerData = {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        country: customer.country,
      }
      
      switch (type) {
        case 'excel':
          exportCustomerToExcel(customerData, filename)
          toast({
            title: "Export Successful",
            description: "Customer exported to Excel successfully",
          })
          break
        case 'word':
          exportCustomerToWord(customerData, filename)
          toast({
            title: "Export Successful",
            description: "Customer exported to Word successfully",
          })
          break
        case 'pdf':
          exportCustomerToPDF(customerData, filename)
          toast({
            title: "Export Successful",
            description: "Customer exported to PDF successfully",
          })
          break
      }
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export customer. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Customers"
        description="Manage your customers"
        actionLabel={canEdit('customers') ? "New Customer" : undefined}
        actionHref={canEdit('customers') ? "/customers/new" : undefined}
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 text-base"
        />
      </div>

      <Card className="border-2 border-blue-400 dark:border-blue-800/60 shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 dark:from-blue-900 dark:via-blue-800 dark:to-blue-900 border-b-0">
              <TableHead className="font-bold text-white">Name</TableHead>
              <TableHead className="font-bold text-white">Email</TableHead>
              <TableHead className="font-bold text-white">Phone</TableHead>
              <TableHead className="font-bold text-white">Address</TableHead>
              <TableHead className="text-right font-bold text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-500 dark:text-gray-300 font-medium">Loading customers...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <Users className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-300 font-medium text-lg">No customers found</p>
                    <p className="text-gray-400 dark:text-gray-400 text-sm">Add your first customer to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/50 transition-colors border-b border-blue-100 dark:border-blue-800">
                  <TableCell className="font-semibold text-blue-900 dark:text-blue-100">{customer.name}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{customer.email}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{customer.phone}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    {customer.address}, {customer.city}, {customer.state}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/customers/${customer.id}`)}
                        className="hover:bg-blue-100 hover:text-blue-700"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit('customers') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/customers/${customer.id}/edit`)}
                          className="hover:bg-blue-100 hover:text-blue-700"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-green-100 hover:text-green-700"
                            title="Export"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleExportCustomer(customer, 'excel')}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Export to Excel
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportCustomer(customer, 'word')}>
                            <FileText className="mr-2 h-4 w-4" />
                            Export to Word
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExportCustomer(customer, 'pdf')}>
                            <File className="mr-2 h-4 w-4" />
                            Export to PDF
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      {canDelete('customers') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(customer.id)}
                          className="hover:bg-red-100 hover:text-red-600"
                          title="Delete"
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
      </Card>
    </div>
  )
}
