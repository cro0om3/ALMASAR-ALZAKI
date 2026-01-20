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
import { Plus, Search, Edit, Trash2, Eye, UserCircle } from "lucide-react"
import { employeeService } from "@/lib/data"
import { Employee } from "@/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()

  useEffect(() => {
    setEmployees(employeeService.getAll())
  }, [])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this employee?")) {
      employeeService.delete(id)
      setEmployees(employeeService.getAll())
    }
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

  const filteredEmployees = employees.filter((e) =>
    e.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Employees"
        description="Manage your employees"
        actionLabel={canEdit('employees') ? "New Employee" : undefined}
        actionHref={canEdit('employees') ? "/employees/new" : undefined}
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 text-base"
        />
      </div>

      <Card className="border-2 border-blue-200/60 shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/50 dark:to-blue-800/50 border-b-2 border-blue-200 dark:border-blue-800">
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Employee Number</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Name</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Email</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Position</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Department</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Salary</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Status</TableHead>
              <TableHead className="text-right font-bold text-blue-900 dark:text-blue-100">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <UserCircle className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-300 font-medium text-lg">No employees found</p>
                    <p className="text-gray-400 dark:text-gray-400 text-sm">Add your first employee to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/50 transition-colors border-b border-blue-100 dark:border-blue-800">
                  <TableCell className="font-semibold text-blue-900 dark:text-blue-100">{employee.employeeNumber}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 font-medium">{employee.firstName} {employee.lastName}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{employee.email}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{employee.position}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{employee.department}</TableCell>
                  <TableCell className="font-semibold text-blue-900 dark:text-blue-100">{formatCurrency(employee.salary)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(employee.status)} className="font-semibold">
                      {employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/employees/${employee.id}`)}
                        className="hover:bg-blue-100 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit('employees') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/employees/${employee.id}/edit`)}
                          className="hover:bg-blue-100 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete('employees') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(employee.id)}
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
      </Card>
    </div>
  )
}
