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
import { Plus, Search, Edit, Trash2, Eye, Building2 } from "lucide-react"
import { vendorService } from "@/lib/data"
import { Vendor } from "@/types"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/shared/PageHeader"
import { Card } from "@/components/ui/card"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function VendorsPage() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { canEdit, canDelete } = usePermissions()

  useEffect(() => {
    setVendors(vendorService.getAll())
  }, [])

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      vendorService.delete(id)
      setVendors(vendorService.getAll())
    }
  }

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.phone.includes(searchTerm)
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title="Vendors"
        description="Manage your vendors"
        actionLabel={canEdit('vendors') ? "New Vendor" : undefined}
        actionHref={canEdit('vendors') ? "/vendors/new" : undefined}
      />

      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 h-12 text-base"
        />
      </div>

      <Card className="border-2 border-blue-200/60 shadow-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/50 dark:to-blue-800/50 border-b-2 border-blue-200 dark:border-blue-800">
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Name</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Email</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Phone</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Contact Person</TableHead>
              <TableHead className="font-bold text-blue-900 dark:text-blue-100">Address</TableHead>
              <TableHead className="text-right font-bold text-blue-900 dark:text-blue-100">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <Building2 className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-500 dark:text-gray-300 font-medium text-lg">No vendors found</p>
                    <p className="text-gray-400 dark:text-gray-400 text-sm">Add your first vendor to get started</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredVendors.map((vendor) => (
                <TableRow key={vendor.id} className="hover:bg-blue-50/50 dark:hover:bg-blue-900/50 transition-colors border-b border-blue-100 dark:border-blue-800">
                  <TableCell className="font-semibold text-blue-900 dark:text-blue-100">{vendor.name}</TableCell>
                  <TableCell className="text-gray-700 dark:text-gray-300">{vendor.email}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{vendor.phone}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">{vendor.contactPerson}</TableCell>
                  <TableCell className="text-gray-600 dark:text-gray-300">
                    {vendor.address}, {vendor.city}, {vendor.state}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push(`/vendors/${vendor.id}`)}
                        className="hover:bg-blue-100 hover:text-blue-700"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {canEdit('vendors') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/vendors/${vendor.id}/edit`)}
                          className="hover:bg-blue-100 hover:text-blue-700"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete('vendors') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(vendor.id)}
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
