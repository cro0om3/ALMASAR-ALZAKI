"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Vendor } from "@/types"

const vendorSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  contactPerson: z.string().optional(),
  // Identity and residence fields (optional)
  idNumber: z.string().optional(),
  passportNumber: z.string().optional(),
  residenceIssueDate: z.string().optional(),
  residenceExpiryDate: z.string().optional(),
  nationality: z.string().optional(),
})

type VendorFormData = z.infer<typeof vendorSchema>

export default function EditVendorPage() {
  const params = useParams()
  const router = useRouter()
  const [vendor, setVendor] = useState<Vendor | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorFormData>({
    resolver: zodResolver(vendorSchema),
  })

  useEffect(() => {
    const id = params.id as string
    if (!id) return
    let cancelled = false
    setLoading(true)
    fetch(`/api/vendors/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((v) => {
        if (cancelled) return
        if (v) {
          setVendor(v)
          reset(v)
        } else setVendor(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [params.id, reset])

  const onSubmit = async (data: VendorFormData) => {
    if (!vendor) return
    setSaving(true)
    try {
      const res = await fetch(`/api/vendors/${vendor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to update vendor')
      }
      router.push(`/vendors/${vendor.id}`)
    } catch (e: any) {
      alert(e?.message || 'Failed to update vendor')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Vendor not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Vendor</h1>
        <p className="text-muted-foreground">Edit vendor information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register("phone")} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input id="contactPerson" {...register("contactPerson")} />
            {errors.contactPerson && (
              <p className="text-sm text-destructive">{errors.contactPerson.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...register("address")} />
            {errors.address && (
              <p className="text-sm text-destructive">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} />
            {errors.city && (
              <p className="text-sm text-destructive">{errors.city.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" {...register("state")} />
            {errors.state && (
              <p className="text-sm text-destructive">{errors.state.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input id="zipCode" {...register("zipCode")} />
            {errors.zipCode && (
              <p className="text-sm text-destructive">{errors.zipCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} />
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country.message}</p>
            )}
          </div>
        </div>

        <div className="border-2 border-blue-400 dark:border-blue-800/60 p-6 rounded-lg">
          <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-gold rounded"></span>
            Identity & Residence Information
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input 
                id="idNumber" 
                {...register("idNumber")} 
                placeholder="رقم الهوية"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passportNumber">Passport Number</Label>
              <Input 
                id="passportNumber" 
                {...register("passportNumber")} 
                placeholder="رقم الجواز"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nationality">Nationality</Label>
              <Input 
                id="nationality" 
                {...register("nationality")} 
                placeholder="الجنسية"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="residenceIssueDate">Residence Issue Date</Label>
              <Input 
                id="residenceIssueDate" 
                type="date"
                {...register("residenceIssueDate")} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="residenceExpiryDate">Residence Expiry Date</Label>
              <Input 
                id="residenceExpiryDate" 
                type="date"
                {...register("residenceExpiryDate")} 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button 
            type="submit"
            variant="gold"
            disabled={saving}
            className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-blue-900 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 shadow-gold hover:shadow-xl font-bold border-2 border-yellow-300/50 px-8 py-3"
          >
            {saving ? 'Saving...' : 'Update Vendor'}
          </Button>
        </div>
      </form>
    </div>
  )
}
