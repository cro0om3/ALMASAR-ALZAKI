"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const customerSchema = z.object({
  name: z.string().optional(),
  email: z.union([z.string().email("Invalid email address"), z.literal("")]).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
})

type CustomerFormData = z.infer<typeof customerSchema>

export default function NewCustomerPage() {
  const router = useRouter()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
  })

  const onSubmit = async (data: CustomerFormData) => {
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create customer')
      }
      router.push("/customers")
    } catch (error: any) {
      console.error('Error creating customer:', error)
      alert('Failed to create customer. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white p-8 md:p-10 rounded-2xl shadow-luxury">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 to-transparent"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-3xl"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">New Customer</h1>
          <p className="text-blue-100 text-lg font-medium">Add a new customer to your system</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-blue-900/30 rounded-lg shadow-md p-6 border border-blue-100 dark:border-blue-800">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded"></span>
            Customer Information
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-blue-900 dark:text-blue-100 font-medium">Name</Label>
              <Input 
                id="name" 
                {...register("name")} 
                className="border-blue-400 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              {errors.name && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-blue-900 dark:text-blue-100 font-medium">Email</Label>
              <Input 
                id="email" 
                type="email" 
                {...register("email")} 
                className="border-blue-400 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-blue-900 dark:text-blue-100 font-medium">Phone</Label>
              <Input 
                id="phone" 
                {...register("phone")} 
                className="border-blue-400 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              {errors.phone && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="text-blue-900 dark:text-blue-100 font-medium">Address</Label>
              <Input 
                id="address" 
                {...register("address")} 
                className="border-blue-400 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              {errors.address && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.address.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-blue-900 dark:text-blue-100 font-medium">City</Label>
              <Input 
                id="city" 
                {...register("city")} 
                className="border-blue-400 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              {errors.city && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-blue-900 dark:text-blue-100 font-medium">State</Label>
              <Input 
                id="state" 
                {...register("state")} 
                className="border-blue-400 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              {errors.state && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode" className="text-blue-900 dark:text-blue-100 font-medium">Zip Code</Label>
              <Input 
                id="zipCode" 
                {...register("zipCode")} 
                className="border-blue-400 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              {errors.zipCode && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.zipCode.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-blue-900 dark:text-blue-100 font-medium">Country</Label>
              <Input 
                id="country" 
                {...register("country")} 
                className="border-blue-400 dark:border-blue-800 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
              {errors.country && (
                <p className="text-sm text-red-600 dark:text-red-400">{errors.country.message}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-500 dark:hover:border-blue-600 font-semibold px-6 py-3"
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="gold"
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 dark:from-yellow-500 dark:via-yellow-600 dark:to-yellow-700 text-blue-900 dark:text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 dark:hover:from-yellow-600 dark:hover:via-yellow-700 dark:hover:to-yellow-800 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 dark:border-yellow-500/50 px-8 py-3"
          >
            Create Customer
          </Button>
        </div>
      </form>
    </div>
  )
}
