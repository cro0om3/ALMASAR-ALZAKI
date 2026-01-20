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
import { Plus, Search, Eye, Edit, Trash2, FileText, Truck, Calendar } from "lucide-react"
import { projectService } from "@/lib/data/project-service"
import { quotationService, customerService, vehicleService } from "@/lib/data"
import { Project } from "@/types/project"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()

  useEffect(() => {
    const loadProjects = () => {
      const allProjects = projectService.getAll()
      // Add customer and vehicle details
      const projectsWithDetails = allProjects.map(p => ({
        ...p,
        customer: customerService.getById(p.customerId),
        quotation: quotationService.getById(p.quotationId),
        vehicles: p.assignedVehicles.map(vId => vehicleService.getById(vId)).filter(Boolean),
      }))
      setProjects(projectsWithDetails)
    }
    loadProjects()
  }, [])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      projectService.delete(id)
      setProjects(projectService.getAll().map(p => ({
        ...p,
        customer: customerService.getById(p.customerId),
        quotation: quotationService.getById(p.quotationId),
        vehicles: p.assignedVehicles.map(vId => vehicleService.getById(vId)).filter(Boolean),
      })))
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "completed":
        return "success"
      case "po_received":
        return "default"
      case "quotation_sent":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getBillingTypeLabel = (type: string) => {
    switch (type) {
      case "hours":
        return "By Hours"
      case "days":
        return "By Days"
      case "fixed":
        return "Fixed Amount"
      default:
        return type
    }
  }

  const filteredProjects = projects.filter((p) =>
    p.projectNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quotationService.getById(p.quotationId)?.quotationNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Projects"
        description="Manage projects and contracts"
        actionLabel={canEdit('projects') ? "New Project" : undefined}
        actionHref={canEdit('projects') ? "/projects/new" : undefined}
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 text-base"
        />
      </div>

      <Card className="border-2 border-blue-200/60 shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/50 dark:to-blue-800/50 border-b-2 border-blue-200 dark:border-blue-800">
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Project Number</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Title</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Customer</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Quotation</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Billing Type</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Vehicles</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Status</TableHead>
              <TableHead className="text-right font-bold text-blue-900 dark:text-blue-100">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-300 font-medium text-lg">No projects found</p>
                    <p className="text-gray-400 dark:text-gray-400 text-sm">Create a new project to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredProjects.map((project) => (
                <TableRow key={project.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/50 transition-colors border-b border-blue-100 dark:border-blue-800">
                  <TableCell className="font-semibold text-blue-900 dark:text-blue-100">
                    {project.projectNumber}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300 font-medium">{project.title}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    {project.customer?.name || "Unknown"}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    {quotationService.getById(project.quotationId)?.quotationNumber || "N/A"}
                  </TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{getBillingTypeLabel(project.billingType)}</span>
                    {project.billingType === 'hours' && project.hourlyRate && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">{formatCurrency(project.hourlyRate)}/hour</span>
                    )}
                    {project.billingType === 'days' && project.dailyRate && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 block">{formatCurrency(project.dailyRate)}/day</span>
                    )}
                  </TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    {project.vehicles && project.vehicles.length > 0 ? (
                      <div className="flex items-center gap-1">
                        <Truck className="h-4 w-4" />
                        <span>{project.vehicles.length} vehicle{project.vehicles.length > 1 ? 's' : ''}</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 dark:text-gray-500">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(project.status)} className="font-semibold">
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/projects/${project.id}`)}
                        className="hover:bg-blue-100 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit('projects') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/projects/${project.id}/edit`)}
                          className="hover:bg-blue-100 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete('projects') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(project.id)}
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
