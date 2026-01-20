"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, ArrowLeft } from "lucide-react"
import { customerService } from "@/lib/data"
import { Customer } from "@/types"
import { usePermissions } from "@/lib/hooks/use-permissions"

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { canEdit } = usePermissions()
  const [customer, setCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    const id = params.id as string
    const c = customerService.getById(id)
    setCustomer(c || null)
  }, [params.id])

  if (!customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Customer not found</p>
      </div>
    )
  }

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
              <h1 className="text-4xl md:text-5xl font-bold mb-2">{customer.name}</h1>
              <p className="text-blue-100 text-lg font-medium">Customer details</p>
            </div>
          </div>
          {canEdit('customers') && (
            <Button 
              onClick={() => router.push(`/customers/${customer.id}/edit`)}
              className="bg-gold hover:bg-gold-dark text-blue-900 font-bold shadow-gold"
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-2 border-blue-200/60">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full"></div>
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Contact Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2 border-b border-blue-100 dark:border-blue-800">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Email:</span>
              <span className="text-gray-700 dark:text-gray-300">{customer.email}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600 dark:text-gray-300 font-medium">Phone:</span>
              <span className="text-gray-700 dark:text-gray-300">{customer.phone}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 border-gold/60 dark:border-gold/40">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-gold to-gold-dark rounded-full"></div>
              <CardTitle className="text-xl font-bold text-blue-900 dark:text-blue-100">Address</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-gray-700 dark:text-gray-300 py-2 border-b border-blue-100 dark:border-blue-800">{customer.address}</p>
            <p className="text-gray-700 dark:text-gray-300 py-2 border-b border-blue-100 dark:border-blue-800">{customer.city}, {customer.state} {customer.zipCode}</p>
            <p className="text-gray-700 dark:text-gray-300 py-2">{customer.country}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
